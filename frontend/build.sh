
docker run --name frontend -p 3000:3000 --rm -it --user "$(id -u):$(id -g)" -v $PWD:/app -w /app node /bin/bash
