# CS 160 OFS Grocery Store

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

## Frontend Setup

Using git clone or unpacking zip navigate to frontend folder  then run following commands terminal.
```bash
## Frontend Setup
$ cd frontend
$ npm i
$ npm run dev

> [!NOTE]
> Default keys in repository aren't lifetime

## Webhook Listener Stripe using default keys

$ stripe listen --forward-to localhost:8080/webhook


