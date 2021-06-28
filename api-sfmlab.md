# SFMLab endpoints

### Get models

Response typings:
```js
{
    models: {
        id: model id (number),
        title: model title (string),
        author: model author (string),
        mature_content: is model contains mature content (boolean),
        created_at: unix timestamp with seconds (number),
        updated_at: unix timestamp with seconds (number),
        thumbnail: model thumbnail (string),
        extension: file extension (string, always '.sfm'),
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

GET /sfmlab/models

<!-- tab:Request params -->

* adult_content - controls adult content visibility. Values: 'included', 'excluded', 'only'
* page - current page
* limit - entries limit per page, default is 50
* search - search query

<!-- tab:Response -->

```js
{
    "models": [
        {
            "id": 31664,
            "title": "Hera Syndulla (Star Wars: Squadrons)",
            "author": "Stealth2111",
            "mature_content": true,
            "created_at": 0,
            "updated_at": 0,
            "thumbnail": "https://thumb.sfmlab.com/item-preview/110000001.overview.png",
            "extension": ".sfm"
        }
    ],
    "pagination": {
        "page": 1,
        "totalPages": 83,
        "totalItems": 4108
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
    mature_content: is model contains mature content (boolean),
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

GET /sfmlab/models/:id

<!-- tab:Request params -->

* id - model id

<!-- tab:Response -->

```js
{
    "id": 26959,
    "title": "Heroes of the Storm - Tyrande",
    "author": "SFMLab-Import",
    "description": "\n                <p><strong>CREDITS:</strong></p>\n<ul>\n<li>Blizzard - Original Models/Textures/Animations</li>\n<li>Yaron - <a href=\"https://sfmlab.com/item/503/\">https://sfmlab.com/item/503/</a></li>\n</ul>\n\n            ",
    "mature_content": true,
    "created_at": 0,
    "updated_at": 0,
    "thumbnail": "https://thumb.sfmlab.com/item-preview/item_preview/111111_uh2hMER.overview.png",
    "images": [
        "https://thumb.sfmlab.com/item-preview/item_preview/111111_uh2hMER.detail.png"
    ],
    "links": [
        {
            "url": "https://ams1.files.sfmlab.com/content/content/file/Tyrande_WO1Z2KA.zip?AWSAccessKeyId=YALKTSWDUPLBGUZZ&Signature=kBNoinLKOjpPSuOkUXilmijeOJk%3D&Expires=1624748419",
            "title": "Tyrande_WO1Z2KA.zip",
            "file_size": "3.01 MB"
        }
    ],
    "extension": ".sfm",
    "file_size": "3.01 MB",
    "tags": [
        "heroes of the storm",
        "world of warcraft",
        "tyrande whisperwind",
        "character",
        "elf",
        "fantasy",
        "female",
        "warcraft",
        "source"
    ],
    "commentaries": [
        {
            "name": "Unidentified",
            "avatar": "https://sfmlab.com/static/img/mike.jpg",
            "message": "\n          \n            \nNice one!\n\n\n          \n        ",
            "date": 0
        },
        {
            "name": "gwamp",
            "avatar": "https://sfmlab.com/static/img/mike.jpg",
            "message": "\n          \n            \nNot bad.\n\n\n          \n        ",
            "date": 0
        },
        {
            "name": "DarkRoxas",
            "avatar": "https://ams0.files.sfmlab.com/content/avatars/DarkRoxas/resized/80/62b906f877c50da06502d25b088534e78eed3dec_s2_n2.jpg",
            "message": "\n          \n            \nNice.\n\n\n          \n        ",
            "date": 0
        },
        {
            "name": "fornaxtacular",
            "avatar": "https://sfmlab.com/static/img/mike.jpg",
            "message": "\n          \n            \nLooks like maxfile is having malware issues, reupped to gdrive:\nhttps://drive.google.com/file/d/0B_ogSMVl1z3JYUxma3o1TXEwYmM/view?usp=sharing\n\n\n          \n        ",
            "date": 0
        },
        {
            "name": "adc13",
            "avatar": "https://sfmlab.com/static/img/mike.jpg",
            "message": "\n          \n            \nik rig pls :)\n\n\n          \n        ",
            "date": 0
        },
        {
            "name": "zepharian",
            "avatar": "https://sfmlab.com/static/img/mike.jpg",
            "message": "\n          \n            \nThe HotS Tyrande Model do not have any facial flexes etc... Blame Blizzard for this\n\n\n          \n        ",
            "date": 0
        },
        {
            "name": "ilmari0",
            "avatar": "https://sfmlab.com/static/img/mike.jpg",
            "message": "\n          \n            \nHi! Tell me, I need a facial animation on this model, but it does not have :с\nWhat do i do? Or is it I'm blind and something did not notice?\n\n\n          \n        ",
            "date": 0
        },
        {
            "name": "Derkahead",
            "avatar": "https://sfmlab.com/static/img/mike.jpg",
            "message": "\n          \n            \nDoes anyone know how to scale her size down? when i load her into sfm she loads but shes a giant xD\n\n\n          \n        ",
            "date": 0
        },
        {
            "name": "ZeratulDenis",
            "avatar": "https://sfmlab.com/static/img/mike.jpg",
            "message": "\n          \n            \nRight click on her name,utilities and add size or something like that\n\n\n          \n        ",
            "date": 0
        },
        {
            "name": "Ayette",
            "avatar": "https://sfmlab.com/static/img/mike.jpg",
            "message": "\n          \n            \nany chance for update that model ?\n\n\n          \n        ",
            "date": 0
        }
    ]
}
```

<!-- tabs:end -->