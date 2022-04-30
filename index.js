import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { createClient } from "@supabase/supabase-js";
import serverless from "serverless-http";

const app = express();
const port = process.env.PORT || 3000;
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

app.get("/", function (req, res) {
    res.send("Hi there! How are you?");
});

app.get("/register-hit", async function (req, res) {
    const slug = req.query.slug;
    if (!slug) {
        res.send("No slug provided");
    }
    let hits = 1;
    const { data, error } = await supabase
        .from("hits")
        .select("hits")
        .eq("id", slug);
    if (error) {
        console.log("Error getting hits: ", error);
        res.send(error);
    }
    if (data && data.length > 0) {
        hits = data[0].hits + 1;
        const { updateData, updateError } = await supabase
            .from("hits")
            .update({ hits: hits })
            .eq("id", slug);
        if (updateError) {
            console.log("Error updating hits: ", updateError);
            res.send(updateError);
        }
    } else {
        const { insertData, insertError } = await supabase
            .from("hits")
            .insert({ id: slug, hits: 1 });
        if (insertError) {
            console.log("Error inserting hits: ", insertError);
            res.send(insertError);
        }
    }
    res.send({ hits: hits });
});

app.listen(port, function () {
    console.log("register hits app listening on port " + port);
});

export const handler = serverless(app);
