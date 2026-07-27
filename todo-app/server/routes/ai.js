import express from "express";
import {ai} from "../services/gemini.js"

const router =express.Router();

router.post("/correct",async(req,res)=>{
    try{
        const {text}=req.body;

        const responce =await ai.models.generateContent({
            model:"gemini-2.5-flash",
            contents:`Correct the spelling and grammar only.
            Do NOT:
            - change the meaning
            - rewrite the sentence
            - add extra words

            Text:
            ${text}
            `,
        });
        res.json({
            corrected: responce.text,

        });
    }
    catch(err){
        console.error(err);
        res.status(500).json({
            message: "AI failed"
        })
    }
});

export default router;