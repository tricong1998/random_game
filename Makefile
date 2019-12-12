make all:
	cd back_end && npm i
	cd front_end && npm i
make reinstall:
	cd back_end && rm -rf node_modules package-lock.json && npm i
	cd front_end && rm -rf node_modules package-lock.json && npm i	

make start
	cd back_end && nodemon bin/www
	cd front_end && npm run serve