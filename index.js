import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// Setup Postgre database.

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "permalist",
  password: "realMadrid137$",
  port: "5432",

});
db.connect();

let items = [];

// This function queries the database to get all the items.
async function getItems() {
  const result = await db.query("Select * From items ORDER BY id ASC");
  return result.rows;

};

// This end point handles the home page and loads all the items from the table.
app.get("/", async (req, res) => {
  try {
    items = await getItems();
    console.log(items);
    res.render("index.ejs", {
      listTitle: "Today",
      listItems: items,
    });

  } catch (error) {
    console.error("Error fetching items from the database: ", error);
    res.status(500).send("An error occurred while fetching items.");
  }
  
});

// This end point handles adding new items to the database.
app.post("/add", async (req, res) => {
  const item = req.body.newItem;
  console.log(item);

  //Add the item to the database.
  try {
    await db.query("Insert into items (title) Values ($1)", [item]);
    res.redirect("/");

  } catch (error) {
    console.error("Error adding items to the list: ", error);
    res.status(500).send("An error occurred while adding the item. ");

  }

});

// This end point handles edit the items and updating it in the database.
app.post("/edit", async (req, res) => {
  const itemID = req.body.updatedItemId;
  const itemTitle = req.body.updatedItemTitle;

  // Update the title of the item with the new information.
  try {
    await db.query("Update items Set title = ($1) Where id = ($2)", [itemTitle, itemID]);
    res.redirect("/");

  } catch (error) {
    console.error("Error updating item title. ", error);
    res.status(500).send("An error occurred while updating the item. ");
  }

});

// This end point handles deleting the item from the database.
app.post("/delete", async (req, res) => {
  const itemID = req.body.deleteItemId;
  console.log(itemID);

  // Delete the item from the list.
  try {
    await db.query("Delete from items Where id = ($1)", [itemID]);
    res.redirect("/");

  } catch (error) {
    console.error("Error deleting item title. ", error);
    res.status(500).send("An error occurred while deleting the item. ");
  }
  
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
