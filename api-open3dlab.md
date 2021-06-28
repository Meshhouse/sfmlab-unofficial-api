# Open3DLab endpoints

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

GET /open3dlab/models

<!-- tab:Request params -->

* page - current page
* limit - entries limit per page, default is 50
* search - search query

<!-- tab:Response -->

```js
{
    "models": [
        {
            "id": 31688,
            "title": "Overwatch - Oasis Hotel",
            "author": "ubermachine",
            "mature_content": false,
            "created_at": 1624744620000,
            "updated_at": 1624803420000,
            "thumbnail": "https://thumb.sfmlab.com/item-preview/Oasis_Hotel_Thumbnail.overview.png",
            "extension": ".blend"
        }
    ],
    "pagination": {
        "page": 1,
        "totalPages": 7,
        "totalItems": 329
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

GET /open3dlab/models/:id

<!-- tab:Request params -->

* id - model id

<!-- tab:Response -->

```js
{
    "id": 31572,
    "title": "Echo - UE5",
    "author": "LeGuymelef",
    "description": "\n                <p>UE5's Echo character ported to Blender with original bones and weights.</p>\n<p>Textures have been converted to jpg and png for normal maps</p>\n<p>Eyes textures are custom using original assets (provided as well)</p>\n<p>There's a mask to hide a few minor parts I couldn't find matching textures for</p>\n<p>Know issue : the scarf is weirdly cut, came out this way from UE</p>\n\n            ",
    "mature_content": false,
    "created_at": 1622282940000,
    "updated_at": 1622283180000,
    "thumbnail": "https://thumb.sfmlab.com/item-preview/Echo1.overview.jpg",
    "images": [
        "https://thumb.sfmlab.com/item-preview/projectfile/Echo1_thumb.detail.png"
    ],
    "links": [
        {
            "url": "https://ams1.files.sfmlab.com/content/content/file/Echo_Open3DLab.blend?AWSAccessKeyId=YALKTSWDUPLBGUZZ&Signature=6fbPyPDz9y26dwyOmkt0McnKfJs%3D&Expires=1624946989",
            "title": "Echo_Open3DLab.blend",
            "file_size": "79.11 MB"
        },
        {
            "url": "https://ams1.files.sfmlab.com/content/content/file/Textures_KBRGOXP.7z?AWSAccessKeyId=YALKTSWDUPLBGUZZ&Signature=0zxB2JFiS9kQmUPC3lr%2FlHGYS9E%3D&Expires=1624946990",
            "title": "Textures_KBRGOXP.7z",
            "file_size": "296.0 MB"
        }
    ],
    "extension": ".blend",
    "file_size": "79.11 MB",
    "tags": [
        "echo",
        "character",
        "female",
        "blender 3.0"
    ],
    "commentaries": [
        {
            "name": "sataran",
            "avatar": "https://ams0.files.sfmlab.com/content/avatars/sataran/resized/80/dragon_foudre.png",
            "message": "\n          \n            \n:) now im happy. dont have to download 100go. thank you!\n\n\n          \n        ",
            "date": 1622486580000
        },
        {
            "name": "dddkhakha3",
            "avatar": "https://ams0.files.sfmlab.com/content/avatars/dddkhakha3/resized/80/dddkhakha1.jpg",
            "message": "\n          \n            \nWill you makke a NSFW version?\n\n\n          \n        ",
            "date": 1623463500000
        },
        {
            "name": "LeGuymelef",
            "avatar": "https://ams0.files.sfmlab.com/content/avatars/LeGuymelef/resized/80/Logo.png",
            "message": "\n          \n            \nUnlikely\n\n\n          \n        ",
            "date": 1624204200000
        }
    ]
}
```

<!-- tabs:end -->