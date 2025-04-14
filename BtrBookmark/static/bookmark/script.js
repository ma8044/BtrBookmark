document.addEventListener('DOMContentLoaded', function() {

    if (document.getElementById('indexUrl')) {
        load_mainpage();
        check_notifs();
        document.getElementById('path-display').dataset.state = "origin";
        display()
        //Form submissions to create a new folder/bookmark
        document.getElementById('bookmark-form').addEventListener('submit', event => {
            bookmark_create();
            event.preventDefault();
            hide_new('bookmark');
        })
        document.getElementById('folder-form').addEventListener('submit', event => {
            folder_create();
            event.preventDefault();
            hide_new('folder');
        })

        //Animations to open and close the new folder/bookmark page
        document.getElementById('make_newfolder').addEventListener('click', () => {
            document.getElementById('newfoldername').value = '';
            show_new("folder");
        })
        document.getElementById('make_newbookmark').addEventListener('click', () => {
            document.getElementById('newbookmarkname').value = '';
            document.getElementById('newbookmarklink').value = '';
            document.getElementById('bookmark_category').value = 'bi bi-bookmark-fill';
            document.getElementById('bookmarkdisplayselected').innerHTML = `<i class="bi bi-bookmark-fill color-icons"></i>`
            show_new("bookmark");
        })
        document.getElementById('closefolder').addEventListener('click', () => hide_new("folder"))
        document.getElementById('closebookmark').addEventListener('click', () => hide_new("bookmark"))
        
        document.getElementById('bookmark_category').addEventListener('change', () => {
            var SelectedValue = document.getElementById('bookmark_category').value;
            document.getElementById('bookmarkdisplayselected').innerHTML = `<i class="${SelectedValue} color-icons"></i>`
        })

        //Animations to close and open the notification bar.
        var notif_open = document.getElementById('notifications').querySelector('.bi');
        notif_open.addEventListener('click', show_notifbar);
        notif_open.addEventListener('mouseover', () => {
            notif_open.classList.remove('bi-bell');
            notif_open.classList.add('bi-bell-fill')
        })
        notif_open.addEventListener('mouseout', () => {
            notif_open.classList.remove('bi-bell-fill');
            notif_open.classList.add('bi-bell')
        })
        

        //animation for close buttons
        document.addEventListener('mouseover', event => {
            element = event.target
            if (element.classList.contains('close')) {
                element.classList.remove('bi-x-square');
                element.classList.add('bi-x-square-fill');
            }
        })
        document.addEventListener('mouseout', event => {
            element = event.target
            if (element.classList.contains('close')) {
                element.classList.remove('bi-x-square-fill');
                element.classList.add('bi-x-square');
            }
        })
        document.getElementById('closeNotifs').addEventListener('click', close_notifbar)

        //actions for handling going into files and coming back from files
        document.addEventListener('dblclick', event => {
            let folder = event.target.closest('.folder-div, .sharechild-div');
            let shared_folder = event.target.closest('.shared-div')
            let bookmark = event.target.closest('.bookmark-div');
            if (folder) {
                change_window(folder.querySelector('.folder-text').innerHTML)
            }
            else if (shared_folder) {
                document.getElementById('path-display').dataset.state = "shared";
                change_window(shared_folder.querySelector('.folder-text').innerHTML);
            }
            else if (bookmark) {
                var bookmarkURL = bookmark.dataset.url;
                if (!bookmarkURL.includes("https://")) {
                    bookmarkURL = "https://" + bookmarkURL;
                }
                window.open(bookmarkURL, '_blank');
            }
        });

        document.getElementById('prevFolder').addEventListener('click', () => {
            go_to_previous()
        })

        //code for handling custom context menu
        document.addEventListener('click', event => {
            let current = event.target.closest('.border-div')
            if (!current) {
                if (!document.querySelector('.border-div')){
                    let target = event.target.closest('.folder-div, .bookmark-div, .shared-div, .sharechild-div')
                    if (target) {
                    target.classList.add('border-div')
                    }
                }
                else {
                    let target = event.target.closest('.folder-div, .bookmark-div, .shared-div, .sharechild-div')
                    if (target) {
                        document.querySelector('.border-div').classList.remove('border-div')
                        target.classList.add('border-div')
                    }
                    else if (!document.querySelector('.customcontext').contains(event.target)) {
                        document.querySelector('.border-div').classList.remove('border-div')
                    }
                }
            }
            if (!document.querySelector('.customcontext').contains(event.target)) {
                document.querySelector('.customcontext').style.display = 'none'
            }

            //handling item deletion
            if (event.target.matches('#delete-folder')) {
                delete_object('folder');
            }
            if (event.target.matches('#delete-bookmark')) {
                delete_object('bookmark');
            }
            if (event.target.matches('.notif-accept')) {
                respond_notif(event.target.dataset.id, true)
            }
            if (event.target.matches('.notif-decline')) {
                respond_notif(event.target.dataset.id, false)
            }
            if (event.target.matches('#remove-shared')) {
                remove_shared();
            }
        })

        //handle context menu
        document.addEventListener('contextmenu', event => {
            let target = event.target.closest('.border-div')
            if (target) {
                event.preventDefault()
                open_contextmenu(target, event)
            }
        })

        //handles renaming
        document.addEventListener('submit', event => {

            if (event.target.matches('#folder-rename-form')) {
                event.preventDefault();
                rename_folder(event.target)
            }
            if (event.target.matches('#bookmark-rename-form')) {
                event.preventDefault();
                rename_bookmark(event.target)
            }
            if (event.target.matches('#share-folder-form')) {
                event.preventDefault();
                send_notif(event.target);
            }
        })

        //listen for notifications every 15 seconds
        setInterval(check_notifs, 15000);
    }
        
})

function load_mainpage() {
    gsap.from("body *", {
        duration: 0.5,
        opacity: 0,
        stagger: 0.05,
        ease: "power2.out"
    })
}

function show_notifbar() {
    document.querySelector('.scrollable-notifs').style.display = "block";
    var tl = gsap.timeline();
        // Animate the width from 0 to 300px
        tl.to(".scrollable-notifs", {
            duration: 0.4,
            width: "350px",
            ease: "power2.out",
        })
        .to(".scrollable-notifs > *", {
            duration: 0.2,
            opacity: 1,
            stagger: 0.05,  // Slight delay between each element
            ease: "power2.out",
            onComplete: function() {
                display_notifs()
            }
        });
}

function close_notifbar() {
    check_notifs();
    var tl = gsap.timeline();
        // Animate the width from 0 to 300px
        tl.to(".scrollable-notifs > *", {
            duration: 0.2,
            opacity: 0,
            stagger: 0.05,
            ease: "power2.out"
            
        })
        .to(".scrollable-notifs", {
            duration: 0.4,
            width: "0px",
            ease: "power2.out",
            onComplete: function() {
                document.querySelector(".scrollable-notifs").style.display = "none";
            }
        })
}

function show_new(type) {
    if (!document.querySelector(".new-open")) {
        document.querySelector(`.new_${type}`).style.display = 'block';
        document.querySelector(`.new_${type}`)
        document.querySelector(`.new_${type}`).classList.add("new-open")
        gsap.fromTo(`.new_${type}`, 
            { opacity: 0 }, 
            { opacity: 1, duration: 0.5 }
        );
        var children = document.querySelector('#dropdown-new').children;
        for (var child of children) {
            child.classList.add('disabled')
        }
    }
}

function hide_new(type) {
    gsap.to(`.new_${type}`, {
        opacity: 0,
        duration: 1,
        onComplete: function() {
            document.querySelector(`.new_${type}`).style.display = 'none';
            document.querySelector(`.new_${type}`).classList.remove("new-open");
            var children = document.querySelector('#dropdown-new').children;
            for (var child of children) {
                child.classList.remove('disabled')
            }
        }
    });
}

function bookmark_create() {
    path = document.getElementById('path-display').value;
    fetch(`/create/${path}`, {
        method: 'POST',
        body: JSON.stringify({
            type: "bookmark",
            name: document.getElementById('newbookmarkname').value,
            link: document.getElementById('newbookmarklink').value,
            category: document.getElementById('bookmark_category').value
        })
    })
    .then(response => response.json())
    .then(result => {
        display();
    });
}

function folder_create() {
    path = document.getElementById('path-display').value;
    fetch(`/create/${path}`, {
        method: 'POST',
        body: JSON.stringify({
            type: "folder",
            name: document.getElementById('newfoldername').value,
        })
    })
    .then(response => response.json())
    .then(result => {
        display();
    });
}

function display() {
    document.querySelector('.all-folders').innerHTML = ''
    path = document.getElementById('path-display').value;

    if (path === '') {
        document.getElementById('prevFolder').classList.add('disabled')
    }
    else if (document.getElementById('prevFolder').classList.contains('disabled')) {
        document.getElementById('prevFolder').classList.remove('disabled')
    }

    fetch(`/display/${path}`)
    .then(response => response.json())
    .then(items => {
        items.forEach(item => {
            display_item(item);
        })
    })
}

function display_item(item) {
    const col = document.createElement('div');
    col.className = "col-6 col-sm-4 col-md-3 col-lg-2"
    if (item.type === "folder") {
        if (item.shared.includes(document.getElementById('currentUser').innerHTML.trim())) {
            col.innerHTML = 
        `<div class="shared-div" data-id="${item.id}">
            <i class="bi bi-folder-fill"></i>
            <span class="folder-text">${item.name}</span>
        </div>`
        }
        else if (document.getElementById('path-display').dataset.state === "shared") {
            col.innerHTML = 
        `<div class="sharechild-div" data-id="${item.id}">
            <i class="bi bi-folder-fill"></i>
            <span class="folder-text">${item.name}</span>
        </div>`
        }
        else {
            col.innerHTML = 
        `<div class="folder-div" data-id="${item.id}">
            <i class="bi bi-folder-fill"></i>
            <span class="folder-text">${item.name}</span>
        </div>`
        }  
    }
    else if (item.type === "link") {
        col.innerHTML =
        `<div class="bookmark-div" data-url="${item.link}" data-id="${item.id}">
            <i class="${item.category} icon-bookmark color-icons"></i>
            <span class="folder-text">${item.name}</span>
        </div>`
    }
    else {console.log("Incorrect Type!")}
    col.style.height = "auto"
    document.querySelector('.all-folders').append(col)
}

function change_window(folder_name) {
    path = document.getElementById('path-display').value;
    document.getElementById('path-display').value = path + folder_name + "/";
    display();
}

function go_to_previous() {
    path = document.getElementById('path-display').value;
    if (path !== "") {
        let SecondlastSlashIndex = path.lastIndexOf('/', path.lastIndexOf('/') - 1)
        let newPath = path.slice(0, SecondlastSlashIndex + 1);
        if (newPath == '') {
            document.getElementById('path-display').dataset.state = "origin";
        }
        document.getElementById('path-display').value = newPath;
        display();
    }
}

function open_contextmenu(target, event) {
    var customcontext = document.querySelector('.customcontext');


    if (target.classList.contains('folder-div')) {
        customcontext.innerHTML = 
        `<div class="btn-group dropend">
            <button type="button" class="btn btn-outline-dark dropdown-toggle text-start contextbutton" data-bs-toggle="dropdown" data-bs-placement="right" aria-haspopup="true" aria-expanded="false">
                <i class="bi bi-arrow-clockwise"></i>&nbsp;&nbsp;Rename
            </button>
            <div class="dropdown-menu customdropdown" id="dropdown-new">
                <form id="folder-rename-form" data-id = ${target.dataset.id}>
                    <div class="input-group mb-3">
                        <input type="text" name="rename" class="form-control" value="${target.querySelector('.folder-text').innerHTML}">
                        <input type="submit" class="btn btn-outline-dark" id="button-addon2" value="Rename">
                    </div>
                </form>
            </div>
        </div>
        <hr style="margin-top: 5px; margin-bottom: 5px;">
        <div class="btn-group dropend">
            <button type="button" class="btn btn-outline-dark dropdown-toggle text-start contextbutton" data-bs-toggle="dropdown" data-bs-placement="right" aria-haspopup="true" aria-expanded="false">
                <i class="bi bi-person-add"></i>&nbsp;&nbsp;Share
            </button>
            <div class="dropdown-menu customdropdown" id="dropdown-new">
                <form id="share-folder-form" data-id = ${target.dataset.id}>
                    <div class="input-group mb-3">
                        <input type="text" name="share" class="form-control" placeholder="Username">
                        <input type="submit" class="btn btn-outline-dark" id="button-addon2" value="Share">
                    </div>
                </form>
            </div>
        </div>
        <hr style="margin-top: 5px; margin-bottom: 5px;">
        <button class="btn btn-outline-dark contextbutton text-start" id="delete-folder"><i class="bi bi-trash3"></i>&nbsp;&nbsp;Delete</button>`
    }
    else if (target.classList.contains('bookmark-div')) {
        customcontext.innerHTML = 
        `<div class="btn-group dropend">
            <button type="button" class="btn btn-outline-dark dropdown-toggle text-start contextbutton" data-bs-toggle="dropdown" data-bs-placement="right" aria-haspopup="true" aria-expanded="false">
                <i class="bi bi-arrow-clockwise"></i>&nbsp;&nbsp;Rename
            </button>
            <div class="dropdown-menu customdropdown" id="dropdown-new">
                <form id="bookmark-rename-form" data-id = ${target.dataset.id}>
                    <div class="input-group mb-3">
                        <input type="text" class="form-control" name="rename" value="${target.querySelector('.folder-text').innerHTML}">
                        <input type="submit" class="btn btn-outline-dark" id="button-addon2" value="Rename">
                    </div>
                </form>
            </div>
        </div>
        <hr style="margin-top: 5px; margin-bottom: 5px;">
        <button class="btn btn-outline-dark contextbutton text-start" id="delete-bookmark"><i class="bi bi-trash3"></i>&nbsp;&nbsp;Delete</button>`
    }
    else if (target.classList.contains('shared-div')) {
        customcontext.innerHTML = 
            `<button class="btn btn-outline-dark contextbutton text-start" id="remove-shared"><i class="bi bi-trash3"></i>&nbsp;&nbsp;Remove</button>`
    }
    else if (target.classList.contains('sharechild-div')) {
        customcontext.innerHTML = 
        `<div class="btn-group dropend">
            <button type="button" class="btn btn-outline-dark dropdown-toggle text-start contextbutton" data-bs-toggle="dropdown" data-bs-placement="right" aria-haspopup="true" aria-expanded="false">
                <i class="bi bi-arrow-clockwise"></i>&nbsp;&nbsp;Rename
            </button>
            <div class="dropdown-menu customdropdown" id="dropdown-new">
                <form id="folder-rename-form" data-id = ${target.dataset.id}>
                    <div class="input-group mb-3">
                        <input type="text" name="rename" class="form-control" value="${target.querySelector('.folder-text').innerHTML}">
                        <input type="submit" class="btn btn-outline-dark" id="button-addon2" value="Rename">
                    </div>
                </form>
            </div>
        </div>
        <hr style="margin-top: 5px; margin-bottom: 5px;">
        <button class="btn btn-outline-dark contextbutton text-start" id="delete-folder"><i class="bi bi-trash3"></i>&nbsp;&nbsp;Delete</button>`
    }
    customcontext.style.display = 'flex';
    customcontext.style.left = `${event.pageX}px`;
    customcontext.style.top = `${event.pageY}px`;
}

function delete_object(type) {
    const object_id = document.querySelector('.border-div').dataset.id;
    fetch(`delete/${type}/${parseInt(object_id)}`)
    .then(response => response.json())
    .then(result => {
        display();
        document.querySelector('.customcontext').style.display = 'none';
    })
}

function rename_folder(target) {

    var folder_id = target.dataset.id;
    var new_name = target.elements['rename'].value;

    if (new_name !== ''){
        fetch(`/rename/folder/${parseInt(folder_id)}`, {
            method: 'POST',
            body: JSON.stringify({
                name: new_name,
            })
        })
        .then(response => response.json())
        .then(result => {
            display();
            document.querySelector('.customcontext').style.display = 'none';
        });
    } 
}

function rename_bookmark(target) {
    var bookmark_id = target.dataset.id;
    var new_name = target.elements['rename'].value;
    
    if (new_name !== '') {
        fetch(`/rename/bookmark/${parseInt(bookmark_id)}`, {
            method: 'POST',
            body: JSON.stringify({
                name: new_name,
            })
        })
        .then(response => response.json())
        .then(result => {
            display();
            document.querySelector('.customcontext').style.display = 'none';
        });
    }
}

function send_notif(target) {
    var folder_id = target.dataset.id;
    var shared_user = target.elements["share"].value;

    if (shared_user !== document.getElementById('currentUser').innerHTML) {
        fetch('/share', {
            method: 'POST',
            body: JSON.stringify({
                folder: parseInt(folder_id),
                user: shared_user
            })
        })
        .then(response => response.json())
        .then(result => {
            document.querySelector('.customcontext').style.display = 'none';
        })
    }
}

function check_notifs() {
    var check = 0;
    fetch('/notif_count')
    .then(response => response.json())
    .then(response => {
        var count = response.count;
        var notif = document.getElementById('notif-circle');
        if (count > 9) {
            notif.style.display = 'flex';
            notif.innerHTML = '9+';
        }
        else if (count > 0) {
            notif.style.display = 'flex';
            notif.innerHTML = count;
        }
        else {
            notif.style.display = 'none';
        }

        if (document.querySelector('.scrollable-notifs').style.display === "block") {
            if (count !== check) {
                check = count;
                display_notifs()
            }
        }
    })
}

function display_notifs() {
    document.getElementById('all-notifs').innerHTML = '';
    fetch('/notifs_display')
    .then(response => response.json())
    .then(notifs => {
        notifs.forEach(notif => {
            var div = document.createElement('div');
            div.className = 'notif';
            div.innerHTML = 
            `<div class="notif-message">
                User <strong>${notif.creator}</strong> has shared the Folder <strong>${notif.folder}</strong> with you.
            </div>
                    <div class="notif-buttons">
                        <button class="notif-accept" data-id="${notif.id}"><i class="bi bi-check"></i></button><button data-id="${notif.id}" class="notif-decline"><i class="bi bi-x"></i></button>
                    </div>
            <hr>`;
            document.getElementById('all-notifs').append(div);
        })
    })
}

function respond_notif(id, bool) {
    fetch(`/notif_respond/${parseInt(id)}`, {
        method: 'PUT',
        body: JSON.stringify({
            "accept": bool
        })
    })
    .then(response => response.json())
    .then(response => {
        console.log(response);
        display_notifs();
        display();
    })
}

function remove_shared() {
    const object_id = document.querySelector('.border-div').dataset.id;
    fetch(`/remove/${parseInt(object_id)}`)
    .then(response => response.json())
    .then(result => {
        console.log(result);
        display();
        document.querySelector('.customcontext').style.display = 'none';
    })
}