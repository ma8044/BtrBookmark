from django.db import models
from django.contrib.auth.models import AbstractUser

# Create your models here.
class User(AbstractUser):
    pass

class Folder(models.Model):
    creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name="all_folders_created")
    shared = models.ManyToManyField(User, related_name = "folders_accepted", blank=True)
    name = models.CharField(max_length=20)
    parent_folder = models.ForeignKey('self', on_delete=models.CASCADE, related_name="folder_children", blank=True, null=True)

    def serialize(self):
        return {
            "type": "folder",
            "id": self.id,
            "creator": self.creator.username,
            "creatorid": self.creator.pk,
            "name": self.name,
            "shared": [user.username for user in self.shared.all()],
        }

class Link(models.Model):
    name = models.CharField(max_length=15)
    category = models.CharField(max_length=64)
    link = models.TextField()
    parent_folder = models.ForeignKey(Folder, on_delete=models.CASCADE, related_name="link_children")
    def serialize(self):
        return {
            "type": "link",
            "id": self.id,
            "name": self.name,
            "category": self.category,
            "link": self.link,
            "parent": self.parent_folder.id
        }

class Notification(models.Model):
    creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name="sent_folders")
    sent_to = models.ForeignKey(User, on_delete=models.CASCADE, related_name="notifications")
    folder = models.ForeignKey(Folder, on_delete=models.CASCADE, related_name="notifs_of_folder")
    accepted = models.BooleanField(default=False)

    def serialize(self):
        return {
            "id": self.id,
            "creator": self.creator.username,
            "sent_to": self.sent_to.username,
            "folder": self.folder.name
        }