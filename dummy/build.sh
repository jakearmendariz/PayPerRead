
docker run --name dummy -p 3001:3001 --rm -it --user "$(id -u):$(id -g)" -v $PWD:/app -w /app node /bin/bash
