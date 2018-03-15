# issue-tracker
RESTful API for basic issue tracker. Implemented with Node.js, Hapi, & MongoDB

## Requirements

1. Node.js (9.8) installed 
2. MongoDB (3.6) installed & Mongo server running

## Setup

1. Clone repo & install dependencies: `npm install`
1. If not running, start MongoDB server
   * `issue-tracker` looks for MongoDB running locally on port 27017. This URL can be configured in `server.js`
1. Start `issue-tracker` server: `node server.js`
   * By default, `issue-tracker` runs locally on port 3000. This can be configured in `server.js`


## Documentation
While the server is running, navigate to `http://localhost:3000/documentation` to view auto-generated [OpenAPI](https://www.openapis.org/) documentation for all endpoints.

Endpoints are also documented in this `README.MD`

## Testing

`issue-tracker` comes with a suite of automated tests that exercise all available endpoints using both happy-path and invalid requests.

Simply run `npm test` in the `issue-tracker` directory.

The test suite creates all data required for testing and will not impact existing data.

The test suite uses Lab, with Code for assertions.


## DB Models

#### **Issue**

* **Title**: Text title of the Issue

* **Description**: Text description of the Issue

* **Files**: Array of ObjectIDs of Files which have been uploaded & associated to the Issue. Empty if no Files are associated.
* **Timestamps** (automatically set): Time of creation & last update

#### **File**

* **filePath**: relative API URL of the file.
  * example: File with `id = 1` and `filename = test_file.txt` has `filePath = issues/1/test_file.txt`
  * This can be appended directly to the API root used by the client (ex: `https://issues.company.com/`) for download by just issuing a `GET` request to `https://issues.company.com/issues/1/test_file.txt`

* **Description**: Text description of the file. If none is provided at upload time, the filename is used.

* **Issue**: ObjectID of the Issue to which the File is associated
* **Timestamps** (automatically set): Time of creation & last update

## Endpoints - Main

#### `GET /issues` 
Returns a list of all Issues. Should any Issues have associated Files, that information is included.

#### `POST /issues`
Create a new Issue. Returns a success message and the created Issue

  * **Parameters**:

    * `title`: Name of the issue

    * `description`: Detail about the issue

    * `file (optional)`: One or more files to be associated to the issue. The payload key must be named `file`.
  * Notes:
    * Request headers `Content-Type` must be set to `multipart/form-data`
    * File size limit is 2 MB

#### `GET /issues/{id}`
Returns details for a single Issue `id`

#### `POST /issues/{id}/files` 
Associates 1 or more files to Issue `id`. Returns a success message and the created Files

  * **Parameters**:

    * **file**: File(s) to be associated with Issue `id`. The payload key must be named `file`.

    * **description** (optional): Detail about the file

* **Notes**: 
 	* Request headers `Content-Type` must be set to `multipart/form-data` 
 	* File size limit is 2 MB
 	* If a file with `filename` is already associated to the Issue, the server will return 400 (Bad Request) when attempting to upload another file with the same name. Use a different filename.


#### `GET /issues/{id}/{filename}` 
Download the file `filename` associated to issue `id`. 
* This is the relative path stored as `filePath`

## Endpoints - Accessory
These endpoints are intended for use by admins and/or future features of the client beyond the original scope

#### `GET /files` 
Returns a list of all Files
* Note: this endpoint does not serve all files for download, but returns the relevant File information for potential use by the client

#### `GET /files/{fileId}`
Returns information about File `id`. 
* Note: this endpoint does not serve the file for download, but returns the relevant File information for potential use by the client

#### `GET /issues/{id}/files`
Returns information about all Files associated to Issue `id`. 
* Note: this does not serve all files associated to Issue `id` for download , but returns the relevant File data for potential use by the client

## Future Enhancement
As requirements change in the future, more features may need to be added. Overall, adding new features requires these steps:
1. Add models (if needed) to a new file in `src/models/`
2. Add route handers (controllers) to a new file in `src/controllers/`
3. Add tests to a new file in `test/`
4. Add documentation to this `README.md`

Routes are dynamically loaded & exported, so no manipulation of `server.js` should be necessary. As long as new routes include `description`, `notes`, and `tags: [api]` in the `config` dictionary of the handler, they will be added to the Swagger documentation.