# Smutbase endpoints

### Get models

Response typings:
```js
{
    models: {
        id: model id (number),
        title: model title (string),
        author: model author (string),
        mature_content: is model contains mature content (boolean, always true),
        created_at: unix timestamp with seconds (number),
        updated_at: unix timestamp with seconds (number),
        thumbnail: model thumbnail (string),
        extension: file extension (string),
    }[],
    pagination: {
        page: current page (number),
        totalPages: total pages (number),
        totalItems: total items matched by criteria (number)
    }
}
```

<!-- tabs:start -->

<!-- tab:URL -->

GET /smutbase/models

<!-- tab:Request params -->

* page - current page
* limit - entries limit per page, default is 50
* search - search query

<!-- tab:Response -->

```js
{
    "models": [
        {
            "id": 31690,
            "title": "Squidshark (subnautica below zero)",
            "author": "Lukas0122_the_best",
            "mature_content": true,
            "created_at": 0,
            "updated_at": 0,
            "thumbnail": "https://thumb.sfmlab.com/item-preview/untitled1_U5Ir77Q.overview.png",
            "extension": ".blend"
        }
    ],
    "pagination": {
        "page": 1,
        "totalPages": 17,
        "totalItems": 843
    }
}
```

<!-- tabs:end -->

### Get single model

Response typings:
```js
{
    id: model id (number),
    title: model title (string),
    author: model author (string),
    description: model description, escaped HTML string (string),
    mature_content: is model contains mature content (boolean, always true),
    created_at: unix timestamp with seconds (number),
    updated_at: unix timestamp with seconds (number),
    thumbnail: model thumbnail (string),
    images: model images (string[]),
    links: {
        url: file URL (string),
        title: file name with extension (string),
        file_size: formatted file size (string)
    }[],
    extension: file extension (string, always '.sfm'),
    file_size: formatted file size (string),
    tags: model tags (string[]),
    commentaries: {
        name: user name (string),
        avatar: user avatar (string),
        message: text (string),
        date: unix timestamp with seconds (number)
    }[]
}
```

<!-- tabs:start -->

<!-- tab:URL -->

GET /smutbase/models/:id

<!-- tab:Request params -->

* id - model id

<!-- tab:Response -->

```js
{
    "id": 31506,
    "title": "Loba [Apex Legends]",
    "author": "nextr3d",
    "description": "\n                <h1>If you find any bugs please submit a ticket <a href=\"https://discord.gg/FyzdcUXp8a\">here</a> or report them on <a href=\"https://twitter.com/nextr3d\">my twitter</a></h1>\n<p>How to</p>\n<p>Export the textures zip next to the blend file.</p>\n<p>When opening the blend file press the 'Allow Execution' button. Than select an armature called Judy, either from the outliner or in the viewport. Press N to expand the menu on the right side of the viewport. Click the <strong>Loba</strong> tab.</p>\n\n<p><strong>Changelog</strong></p>\n\n<p>v1.2</p>\n<ul>\n<li>added penis</li>\n<li>did a face transplant so she doesn't look like Shrek anymore(if you prefer the original face you can keep/download the textures from v1.1)</li>\n<li>added 1 type of makeup</li>\n<li>now you can change the color of her makeup(3 colors)</li>\n<li>added lip color and lip color strength</li>\n<li>updated the UI v4.3.0</li>\n<li>fixed a typo</li>\n</ul>\n<p>v1.1</p>\n<ul>\n<li>Slightly un-Shreked her face, now her textures are straight from the game</li>\n<li>Added rest of the epic default skin variations(still missing the decals, haven't figured them out yet)</li>\n<li>Fixed broken UVs on her shoes</li>\n<li>Removed the color changer from other skins which don't support it, renamed it to Accent color</li>\n<li>Added toenails to the UI</li>\n<li>Added the wolf tattoo</li>\n<li>Updated the UI to the newest version</li>\n</ul>\n<p>v1.0</p>\n<ul>\n<li>Clean topology on her body(or at least I tried)</li>\n<li>Rigged face, body, breasts, genitals, hair</li>\n<li>Rigged Main outfit with default skin(you can set your own color), Hack the System, Fiber Optics and Demon Hunter skins</li>\n<li>Custom UI</li>\n</ul>\n<p>not required but you can tag me on twitter so I can see what you create with her</p>\n<p><strong>Known bugs</strong></p>\n<p>Broken UVs on her shoes.</p>\n<p>The skins are probably not exactly the same as in-game.(If you know what to do with some of the textures let me know!).</p>\n<p>There are probably some other things which I missed so report the bugs!</p>\n<p><strong>Are you working on a model and want a very cool UI for it?</strong></p>\n<p><strong><a href=\"https://github.com/nextr3d/Character-UI\">Get it here, change just one line in the code and it just works!</a></strong></p>\n<p>If you need help with implementation hit me up on <a href=\"https://twitter.com/nextr3d\">twitter</a></p>\n\n            ",
    "mature_content": true,
    "created_at": 1620568320000,
    "updated_at": 1622294340000,
    "thumbnail": "https://thumb.sfmlab.com/item-preview/thumb_N9pWcqM.overview.jpg",
    "images": [
        "https://thumb.sfmlab.com/item-preview/projectfile/03_e_thumb.detail.png",
        "https://thumb.sfmlab.com/item-preview/projectfile/04_e_no_wm_thumb.detail.png",
        "https://thumb.sfmlab.com/item-preview/projectfile/05_e_no_wm_thumb.detail.png"
    ],
    "links": [
        {
            "url": "https://ams1.files.sfmlab.com/content/content/file/Loba_1.2.blend?AWSAccessKeyId=YALKTSWDUPLBGUZZ&Signature=1cJ89bcFQ9bsAIwzglFxQru4MJc%3D&Expires=1624947074",
            "title": "Loba_1.2.blend",
            "file_size": "36.25 MB"
        },
        {
            "url": "https://ams1.files.sfmlab.com/content/content/file/textures_D2LXY1p.zip?AWSAccessKeyId=YALKTSWDUPLBGUZZ&Signature=8DnkC1VcepcAWbR8M5TW%2Fy1Uqqo%3D&Expires=1624947074",
            "title": "textures_D2LXY1p.zip",
            "file_size": "63.88 MB"
        },
        {
            "url": "https://ams1.files.sfmlab.com/content/content/file/textures_n6tbidr.zip?AWSAccessKeyId=YALKTSWDUPLBGUZZ&Signature=NggMo9u5ewCu%2FRF2N8w2BhPcIMM%3D&Expires=1624947075",
            "title": "textures_n6tbidr.zip",
            "file_size": "120.84 MB"
        }
    ],
    "extension": ".blend",
    "file_size": "36.25 MB",
    "tags": [
        "apex legends",
        "loba",
        "female",
        "futa",
        "blender",
        "blender 2.9"
    ],
    "commentaries": [
        {
            "name": "LSxSEPTIC",
            "avatar": "https://smutba.se/static/img/mike.jpg",
            "message": "\n          \n            \nFinally after all this time it finally made it here exelent work BTW\n\n\n          \n        ",
            "date": 1620572280000
        },
        {
            "name": "qriatek",
            "avatar": "https://smutba.se/static/img/mike.jpg",
            "message": "\n          \n            \nWow. Awesome work. Wait for Wattson!\n\n\n          \n        ",
            "date": 1620598380000
        },
        {
            "name": "sus111",
            "avatar": "https://smutba.se/static/img/mike.jpg",
            "message": "\n          \n            \nWow. Fantastic model. Easy to use. Can't wait for Valkeryie! Is there a way to change the color of the toenails? I was able to change the fingernails but I cant seem to find a way to change the toenail color.\n\n\n          \n        ",
            "date": 1620611580000
        },
        {
            "name": "nextr3d >",
            "avatar": "https://ams0.files.sfmlab.com/content/avatars/nextr3d/resized/80/Untitled.png",
            "message": "\n          \n            \nThanks! Yes, you can change the color of her toenails. You will have to change it manually in the material.\n\n\n          \n        ",
            "date": 1620631320000
        },
        {
            "name": "wazzbo",
            "avatar": "https://smutba.se/static/img/mike.jpg",
            "message": "\n          \n            \nAmazing! Haven't tried yet but there are some Loba models but they all require tinkering.\n\n\n          \n        ",
            "date": 1620647820000
        },
        {
            "name": "Gabey4Heal",
            "avatar": "https://ams0.files.sfmlab.com/content/avatars/Gabey4Heal/resized/80/7d88b783-83cd-49de-afa7-2fb44031ea9c.jpg",
            "message": "\n          \n            \nThis looks fantastic, im deffo checking it out eventually cause Loba is a certified QT!\n\n\n          \n        ",
            "date": 1620657360000
        },
        {
            "name": "tcz12",
            "avatar": "https://smutba.se/static/img/mike.jpg",
            "message": "\n          \n            \nwait, weren't there more apex models?\n\n\n          \n        ",
            "date": 1620669120000
        },
        {
            "name": "iDog",
            "avatar": "https://smutba.se/static/img/mike.jpg",
            "message": "\n          \n            \nThere were, I don't know what happened to them.\n\n\n          \n        ",
            "date": 1621355100000
        },
        {
            "name": "tcz12",
            "avatar": "https://smutba.se/static/img/mike.jpg",
            "message": "\n          \n            \nDamn, anyone still has them?\n\n\n          \n        ",
            "date": 1624204740000
        },
        {
            "name": "elburrito",
            "avatar": "https://ams0.files.sfmlab.com/content/avatars/elburrito/resized/80/22-227715_aesthetic-church-vaporwave-png-tumblr-purple-aesthetic-statue.png",
            "message": "\n          \n            \nI appreciate your models. Always such care and detail put into them!\n\n\n          \n        ",
            "date": 1620841800000
        },
        {
            "name": "elburrito",
            "avatar": "https://ams0.files.sfmlab.com/content/avatars/elburrito/resized/80/22-227715_aesthetic-church-vaporwave-png-tumblr-purple-aesthetic-statue.png",
            "message": "\n          \n            \nI appreciate your models. Always such care and detail put into them!\n\n\n          \n        ",
            "date": 1620841800000
        },
        {
            "name": "infidelain",
            "avatar": "https://smutba.se/static/img/mike.jpg",
            "message": "\n          \n            \nonly i can see her right lips rig is not right shape?\n\n\n          \n        ",
            "date": 1621427880000
        },
        {
            "name": "TrashcanWasabi",
            "avatar": "https://smutba.se/static/img/mike.jpg",
            "message": "\n          \n            \nGreat work! are the arms able to be switched to fk?\n\n\n          \n        ",
            "date": 1622111340000
        },
        {
            "name": "nextr3d >",
            "avatar": "https://ams0.files.sfmlab.com/content/avatars/nextr3d/resized/80/Untitled.png",
            "message": "\n          \n            \nYes, but I think you have to install the Blenrig addon\nhttps://cloud.blender.org/p/blenrig/5cb14ebd808c0e07cdde1d03\n\n\n          \n        ",
            "date": 1622114280000
        },
        {
            "name": "TrashcanWasabi",
            "avatar": "https://smutba.se/static/img/mike.jpg",
            "message": "\n          \n            \nGreat work! are the arms able to be switched to fk?\n\n\n          \n        ",
            "date": 1622111340000
        },
        {
            "name": "tödelö",
            "avatar": "https://smutba.se/static/img/mike.jpg",
            "message": "\n          \n            \nReally nice work, as all of your models are. The \"unshreking\" looks good. Unfortunately when I open the file, the head ist solid black, as is the makeup primary color. I can change the makeup primary color but this only leads to a uniform colored head. Tried to fiddle with the shading but no luck. Am I missing something? I use 2.92\n\n\n          \n        ",
            "date": 1622385540000
        },
        {
            "name": "nextr3d >",
            "avatar": "https://ams0.files.sfmlab.com/content/avatars/nextr3d/resized/80/Untitled.png",
            "message": "\n          \n            \ndid you download the new textures zip? if the mask is not present it probably would do the thing it did to you. delete both the blend file and the textures folder and download it again. But pick the new textures zip! this one: textures_D2LXY1p.zip\n\n\n          \n        ",
            "date": 1622444160000
        },
        {
            "name": "tödelö",
            "avatar": "https://smutba.se/static/img/mike.jpg",
            "message": "\n          \n            \nYep, works. I Mashed up the texturefolders somehow. THX!\n\n\n          \n        ",
            "date": 1622458800000
        }
    ]
}
```

<!-- tabs:end -->