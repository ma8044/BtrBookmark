import json
from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse

from .models import *

# Create your views here.
def index(request):
    return render(request, 'bookmark/index.html', {
        "user": request.user
    })


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "bookmark/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "bookmark/login.html")
    

def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "bookmark/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "bookmark/register.html", {
                "message": "Username already taken."
            })
        folder = Folder(creator = user, name="_USER_"+user.username)
        folder.save()
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "bookmark/register.html")
    
def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def display(request, path=""):
    if request.method != "GET":
        return JsonResponse({"error": "GET Request Method required."}, status=400)
    current_folder = Folder.objects.get(name = "_USER_"+request.user.username)
    try:
        if path != "":
            path_list = path.split("/")
            for file in path_list:
                if current_folder.folder_children.filter(name=file).exists():
                    current_folder = current_folder.folder_children.get(name=file)
                elif request.user.folders_accepted.filter(name=file).exists():
                    current_folder = request.user.folders_accepted.get(name=file)
                else:
                    return JsonResponse({"error": "Folder cannot be found"}, status=400)
    except Folder.DoesNotExist:
        return JsonResponse({"error": "Folder does not exist."}, status=400)
    try:
        serialized_folders = [folder.serialize() for folder in current_folder.folder_children.all()]
        displayed = serialized_folders
        if path == '':
            shared_folders = [folder.serialize() for folder in request.user.folders_accepted.all()]
            displayed += shared_folders
        serialized_bookmarks = [link.serialize() for link in current_folder.link_children.all()]
        displayed += serialized_bookmarks
        return JsonResponse(displayed, safe=False)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@login_required
@csrf_exempt
def create_new(request, path = ""):
    if request.method != "POST":
        return JsonResponse({"error": "GET Request Method required."}, status=400)
    current_folder = Folder.objects.get(name = "_USER_"+request.user.username)
    try:
        if path != '':
            path_list = path.split('/')
            for file in path_list:
                if current_folder.folder_children.filter(name=file).exists():
                    current_folder = current_folder.folder_children.get(name=file)
                elif request.user.folders_accepted.filter(name=file).exists():
                    current_folder = request.user.folders_accepted.get(name=file)
                else:
                    return JsonResponse({"error": "Folder cannot be found."}, status=400)
    except Folder.DoesNotExist:
        return JsonResponse({"error": "Folder does not exist."}, status=400)
    try:
        if not check_shared(current_folder, request.user):
            return JsonResponse({"error": "Unauthorized to create objects here."}, status = 400)
        data = json.loads(request.body)
        type = data.get("type")
        if type == "bookmark":
            name = data.get("name")
            category = data.get("category")
            link = data.get("link")
            if (name == '') or (link == '') or (category == ''):
                return JsonResponse({'error': 'All fields are required'}, status = 400)
            link = Link(
                name = name,
                category = category,
                link = link,
                parent_folder = current_folder
            )
            link.save()
        elif type == "folder":
            name = data.get("name")

            if (name == ''):
                return JsonResponse({'error': 'Name field cannot be empty'}, status = 400)
            if (name.startswith("_USER_")):
                return JsonResponse({'error': 'Unauthorized Name.'}, status = 400)
            if current_folder.folder_children.filter(name = name).exists():
                name = f"{name}({current_folder.folder_children.filter(name__contains = name).count()})"

            folder = Folder(
                creator = request.user,
                name = name,
                parent_folder = current_folder
            )
            folder.save()
        else:
            return JsonResponse({"error": "Incorrect type."}, status=400)
        return JsonResponse({"message": "Created Successfully!"}, status=201)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@login_required
def delete(request, type, id):
    if request.method != "GET":
        return JsonResponse({"error": "GET request method required."}, status=400)
    try:
        if type == "bookmark":
            bookmark = Link.objects.get(pk = id)
            parent_folder = bookmark.parent_folder
            shared = check_shared(parent_folder, request.user)

            if (not shared):
                return JsonResponse({"error": "Not authorized to make this change."}, status=400)
            
            bookmark.delete()
        elif type == "folder":
            folder = Folder.objects.get(pk = id)
            shared = check_shared(folder, request.user)

            if (not shared  or request.user in folder.shared.all()):
                return JsonResponse({"error": "Not authorized to make this change."}, status=400)
            
            folder.delete()
        else:
            return JsonResponse({"error": "Incorrect object type."}, status=400)
        
        return JsonResponse({"message": "Object deleted successfully."}, status=201)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
    
@csrf_exempt
@login_required
def rename(request, type, id):
    if request.method != "POST":
        return JsonResponse({"error": "POST request method required."}, status=400)
    try:
        data = json.loads(request.body)
        if type == "folder":
            folder = Folder.objects.get(pk=id)
            shared = check_shared(folder, request.user)
            print(shared)
            if (not shared or request.user in folder.shared.all()):
                return JsonResponse({"error": "Not authorized to make this change."}, status=400)
            name = data.get("name")
            if (name == ''):
                return JsonResponse({'error': 'Name field cannot be empty'}, status = 400)
            if (name.startswith("_USER_")):
                return JsonResponse({'error': 'Unauthorized Name.'}, status = 400)
            if folder.parent_folder.folder_children.filter(name = name).exists():
                name = f"{name}({folder.parent_folder.folder_children.filter(name__contains = name).count()})"
            
            folder.name = name
            folder.save()
        if type == "bookmark":
            bookmark = Link.objects.get(pk = id)
            parent_folder = bookmark.parent_folder
            print(parent_folder.name)
            shared = check_shared(parent_folder, request.user)
            print(parent_folder.name)
            if (not shared):
                return JsonResponse({"error": "Not authorized to make this change."}, status=400)
            bookmark.name = data.get("name")
            bookmark.save()

        return JsonResponse({"message": "Rename Successful"}, status=200)
    except Exception as e:
        print(str(e))
        return JsonResponse({"error": str(e)}, status=500)


def check_shared(folder, user):


    if folder.creator == user:
        return True
    
    if folder.name.startswith("_USER_"):
        return False

    if user in folder.shared.all():
        return True
    
    if folder.parent_folder:
        return check_shared(folder.parent_folder, user)
    
    return False



@login_required
@csrf_exempt
def share_folder(request):
    if request.method != 'POST':
        return JsonResponse({"error": "POST request method required."}, status=400)
    
    try:
        data=json.loads(request.body)
        try:
            user = User.objects.get(username = data["user"])
            folder = Folder.objects.get(pk = data["folder"])
        except User.DoesNotExist and Folder.DoesNotExist:
            return JsonResponse({"error": "User or Folder does not exist"}, status=400)
        if user == request.user:
            return JsonResponse({"error": "Cannot share folder with self."}, status=400)
        if folder.creator != request.user:
            return JsonResponse({"error": "Can only share folders that you created."}, status=400)
        if user in folder.shared.all():
            return JsonResponse({"error": "Can not share folder with same user twice"}, status=500)
        if Notification.objects.filter(creator = request.user, sent_to = user, folder = folder).exists():
            return JsonResponse({"error": "Can not send two share requests of the same folder."}, status=500)


        notification = Notification(
            creator = request.user,
            sent_to = user,
            folder = folder
        )
        notification.save()
        return JsonResponse({"message":"Share request sent"}, status = 200)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
    
@login_required
def notif_count(request):
    user = request.user
    count = user.notifications.all().count()

    return JsonResponse({"count": count}, status = 200)


@login_required
def notif_display(request):
    if request.method != "GET":
        return JsonResponse({"error": "GET request method required."}, status=400)
    try:
        user = request.user
        notifications = [notif.serialize() for notif in user.notifications.all()]
        return JsonResponse(notifications, safe=False)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@csrf_exempt
@login_required
def notif_respond(request, id):
    if request.method != "PUT":
        return JsonResponse({"error": "PUT request required"}, status=400)
    try:
        notif = Notification.objects.get(pk = id)
    except Notification.DoesNotExist:
        return JsonResponse({"error": "Object does not exist"}, status=400)
    
    if request.user != notif.sent_to:
        return JsonResponse({"error": "Unauthorized change."}, status=400)
    
    try:
        data = json.loads(request.body)
        if data["accept"]:
            notif.folder.shared.add(request.user)
        notif.delete()
        return JsonResponse({"message": "Request Completed"}, status=200)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

def remove_shared(request, id):
    if request.method != "GET":
        return JsonResponse({"error": "GET request method required."}, status=400)
    try:
        folder = Folder.objects.get(pk = id)
    except Folder.DoesNotExist:
        return JsonResponse({"error": "Folder does not exist"}, status=400)
    
    if request.user not in folder.shared.all():
        return JsonResponse({"error": "Unauthorized change."}, status=400)
    try:
        folder.shared.remove(request.user)
        return JsonResponse({"message":"Removal Successful"}, status = 200)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)