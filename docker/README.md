
To build an image:
docker build -t image-name - < dockerfile-name

where image-name is the name of the resulting image
and dockerfile-name is the dockerfile to be built from


For instance, to run a local development container for nightly rust for this project,
build the image from the associated Dockerfile in this container, and then modify the run.sh file to
run that specific image.

Also, for the build.sh file in the frontend, you may need to build a node image beforehand, although I'm not 100% on that.


To run a local MongoDB container, run the following:
docker run -d --rm --name payperread_mongodb -p 27017:27017 -e MONGO_INITDB_ROOT_USERNAME=mongo -e MONGO_INITDB_ROOT_PASSWORD=admin mongo
And then in your .env file use:
MONGO_URI=mongodb://mongo:admin@0.0.0.0:27017

To stop the container, run:
docker stop payperread_mongodb
