from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('login', views.login_view, name='login'),
    path('register', views.register, name='register'),
    path('logout', views.logout_view, name='logout'),

    path('create/<path:path>/', views.create_new, name="create_with_path"),
    path('create/', views.create_new, name="create"),

    path('display/', views.display, name="display"),
    path('display/<path:path>/', views.display, name="display_with_path"),
    path('delete/<str:type>/<int:id>', views.delete, name="delete"),
    path('rename/<str:type>/<int:id>', views.rename, name="rename"),
    path('share', views.share_folder, name="share"),
    path('notif_count', views.notif_count, name="notif count"),
    path('notifs_display', views.notif_display, name="notif display"),
    path('notif_respond/<int:id>', views.notif_respond, name="a and d"),
    path('remove/<int:id>', views.remove_shared, name="remove")
]