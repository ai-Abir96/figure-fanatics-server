const express = require("express");
const cors = require("cors");
const {
  MongoClient,
  ServerApiVersion,
  ObjectId,
} = require("mongodb");
require("dotenv").config();

const uri = `mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@cluster0.uhjduzi.mongodb.net/?retryWrites=true&w=majority`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const app = express();
app.use(express.json());
app.use(cors());

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7
    await client.connect(() => {
      console.log("mongo connected");
    });
    // Send a ping to confirm a successful connection

    const actionFigureCollection = client
      .db("toyCollection")
      .collection("actionfiguretoys");

    //add an Action Figure
    app.post("/add-action-figure", async (req, res) => {
      const newActionFigure = req.body;
      const result = await actionFigureCollection.insertOne(
        newActionFigure
      );
      return res
        .status(200)
        .send({ msg: "Inserted Action Figure Successfully", result });
    });

    //get All Action Figure
    app.get("/get-all-action-figure", async (req, res) => {
      const searchByName = req.query.search;
      try {
        const allActionFigures = await actionFigureCollection
          .find({ toyName: { $regex: new RegExp(searchByName) } })
          .limit(20)
          .toArray();
        if (allActionFigures.length === 0) {
          return res.status(200).send({
            message: "No Action Figure Found",
            allActionFigures,
          });
        }
        return res.status(200).send({
          message: "Action Figures Found SuccessFully",
          allActionFigures,
        });
      } catch (error) {
        return res.status(500).json({
          error: "An error occurred while searching for toys.",
        });
      }
    });

    //get Single Action Figure
    app.get("/get-single-action-figure/:id", async (req, res) => {
      const actionFigureID = req.params.id;

      try {
        const singleActionFigure =
          await actionFigureCollection.findOne({
            _id: ObjectId(actionFigureID),
          });

        if (singleActionFigure.length === 0) {
          return res.status(200).send({
            message: "No Action Figure Found",
            singleActionFigure,
          });
        }
        return res.status(200).send({
          message: "Action Figures Found SuccessFully",
          singleActionFigure,
        });
      } catch (error) {
        return res.status(500).json({
          error:
            "An error occurred while searching for toys for the id.",
        });
      }
    });

    //view Action Figures by category
    app.get("/action-figures/:sub_category", async (req, res) => {
      const actionFigureSubCategory = req.params.sub_category;
      try {
        const categoryActionFigures = await actionFigureCollection
          .find({ sub_category: actionFigureSubCategory })
          .toArray();

        console.log(categoryActionFigures);

        if (categoryActionFigures.length === 0) {
          return res.status(200).send({
            message: "No Action Figures Found in this Category",
            categoryActionFigures,
          });
        }
        return res.status(200).send({
          message: "Action Figure SuccessFully",
          categoryActionFigures,
        });
      } catch (error) {
        return res.status(500).json({
          error:
            "An error occurred while searching for toys for the category.",
        });
      }
    });

    //get items by user email
    app.get("/action-figure/:useremail", async (req, res) => {
      const actionFigureByEmail = req.params.useremail;
      const sortOrder = req.query.sort;
      console.log(sortOrder);
      try {
        let sortBy = {};
        if (sortOrder === "asc") {
          sortBy = { price: 1 };
        } else if (sortOrder === "dsc") {
          sortBy = { price: -1 };
        }
        const usersActionFigures = await actionFigureCollection
          .find({ seller_email: actionFigureByEmail })
          .sort(sortBy)
          .toArray();

        if (usersActionFigures.length === 0) {
          return res.status(200).send({
            message: "No Action Figures Found in this Category",
            usersActionFigures,
          });
        }
        return res.status(200).send({
          message: "Action Figure SuccessFully",
          usersActionFigures,
        });
      } catch (error) {
        return res.status(500).json({
          error:
            "An error occurred while searching for toys for the user.",
        });
      }
    });

    //delete an Action Figure
    app.delete("/delete/action-figure/:id", async (req, res) => {
      const actionFigureID = req.params.id;
      try {
        const deletedActionFigure =
          await actionFigureCollection.deleteOne({
            _id: ObjectId(actionFigureID),
          });

        if (deletedActionFigure.deletedCount === 1) {
          return res
            .status(200)
            .send({ message: "Action Figure Deleted Successfully" });
        } else {
          return res
            .status(404)
            .send({ message: "Action Figure Not Found" });
        }
      } catch (error) {
        return res.status(500).json({
          error:
            "An error occurred while deleting the toy for toys for the user.",
        });
      }
    });

    //update an Action Figure info
    app.put("/action-figure/:id", async (req, res) => {
      const actionFigureID = req.params.id;
      const updatedToyInfo = req.body;
      try {
        const updatedActionFigure =
          await actionFigureCollection.updateOne(
            {
              _id: ObjectId(actionFigureID),
            },
            { $set: updatedToyInfo }
          );

        if (updatedActionFigure.modifiedCount === 1) {
          return res.status(200).send({
            message: "Action Figure Modified Successfullyy",
          });
        } else {
          return res
            .status(404)
            .send({ message: "No Action Figure Found" });
        }
      } catch (error) {
        return res.status(500).json({
          error:
            "An error occurred while updating the toy for toys for the user.",
        });
      }
    });
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);

const port = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send("Action Figure Fanatics server  is running");
});

app.listen(port, () => {
  console.log(`server running on port ${port}`);
});
