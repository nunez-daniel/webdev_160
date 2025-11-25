# CS 160 OFS Grocery Store


## DOCKER SETUP

Clone or download the code from the github repository
Once installed make sure to have a docker desktop installation
Navigate to downloaded code and run the commands based on OS they will setup docker and load premade sql database into your environment

# 1. MAC AND WINDOWS COMMAND
```cd webdev_160```

docker compose -f docker-compose.dev.yml up --build -d


# 2.MAC COMMAND TO LOAD DATA 
for file in DatabaseData/*.sql; do docker exec -i mysql_db mysql -u root -pPassword123 ofs_db < "$file"; done


# 2.WINDOWS COMMAND TO LOAD DATA
for %%f in (DatabaseData\*.sql) do (
    type "%%f" | docker exec -i mysql_db mysql -u root -pPassword123 ofs_db
)





Once you’ve ran the two commands you are ready to navigate to http://localhost:5173/

Admin Accounts in Database that will already exist:

<LIST ACCOUNT AND PASSWORD HERE>
Test@Test.com:Test@Test.com1

Fee Product that will exist in the database default is 65 can change in application.properties file in backend





















## NON DOCKER
## Database Setup

This is a general outline of the steps NOT FINAL.

This project uses MySQL. Install it according to your platform's guides.
For reference, here is a limited list of common platforms:
[Windows](https://dev.mysql.com/downloads/installer/),
[macOS](https://dev.mysql.com/downloads/mysql/8.0.html) (one of many choices),
[Ubuntu](https://www.digitalocean.com/community/tutorials/how-to-install-mysql-on-ubuntu-22-04),

Create a user and a database. Below the database will be `ofs_db` with password `Password123`, replace all occurrences of them with your choice.

# TODO...

Initialize the database by running the `db_setup.sql` file. This creates the necessary tables and other things.

Insert example data by running `db_initialize_data.sql`. This loads the set of example data for demonstration purposes, or use postman to test out POST methods.

## Docker

Initialize the container setup with 
$ docker compose -f docker-compose.dev.yml up --build
and after first initial build run 
$ docker compose -f docker-compose.dev.yml up

## Frontend Setup

Using git clone or unpacking zip navivate to frontend folder  then run following commands terminal.
```bash
## Frontend Setup
$ cd frontend
$ npm i
$ npm run dev

> [!NOTE]
> Default keys in repository aren't lifetime

## Webhook Listener Stripe using default keys

$ stripe listen --forward-to localhost:8080/webhook








