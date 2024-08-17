
const express = require('express');
const router= express.Router();
var fetchuser   = require ('../middleware/fetchuser')
const Note= require('../models/Note')
const{body,validationResult} = require('express-validator')
const fs= require('fs')
const PDFDocument = require("pdfkit");
//Route:1
// Get all notes using GET"/api/notes/fetchallnotes".login required.
router.get('/fetchallnotes',fetchuser ,async(req,res)=>{
    try{
 const notes=await Note.find({user:req.user.id});
    res.json(notes)
    }catch(error){
            console.error(error.message);
    res.status(500).send("Internal server error");
    }
   
})
//Route:2
// Add a new note using POST "/api/notes/addnote".login required.
router.post('/addnote',fetchuser ,[
    body('title','Enter a valid title').isLength({ min: 3 }),
    body('description','Description must be atleast 5 characters').isLength({min:5}),],async(req,res)=>{
       try{
        const {title,description,tag}=req.body;
    // if error then send bad request
        const error=validationResult(req);
if(!error.isEmpty()){
    return res.status(400).json({error: error.array()});
}
    const note=new Note({
        title,description,tag,user:req.user.id
    })
    const savedNote = await note.save()
    res.json(savedNote)
}catch(error){
    console.error(error.message);
    res.status(500).send("Internal server error");
}
})

//Route:3
// Update an existing note using POST "/api/notes/updatenote".login required.
router.put('/updatenote/:id', fetchuser, async (req, res) => {
    const {title, description, tag} = req.body;
    // Create a newNote object
    const newNote  = {};
    if(title){newNote.title = title};
    if(description){newNote.description = description};
    if(tag){newNote.tag = tag};

    // Find the note to be updated and update it
    let note = await Note.findById(req.params.id);
    if(!note){return res.status(404).send("Not Found")}

    if(note.user.toString() !== req.user.id){
        return res.status(401).send("Not Allowed");
    }

    note = await Note.findByIdAndUpdate(req.params.id, {$set: newNote}, {new:true})
    res.json({note});
  })

  // ROUTE 4: Delete an existing Note using: DELETE "/api/notes/deletenote". Login required
router.delete('/deletenote/:id', fetchuser, async (req, res) => {
    try {
        // Find the note to be delete and delete it
        let note = await Note.findById(req.params.id);
        if (!note) { return res.status(404).send("Not Found") }

        // Allow deletion only if user owns this Note
        if (note.user.toString() !== req.user.id) {
            return res.status(401).send("Not Allowed");
        }

        note = await Note.findByIdAndDelete(req.params.id)
        res.json({ "Success": "Note has been deleted", note: note });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})

  // ROUTE 5: Exporting note into pdf format: GET "/api/notes/exportnote". Login required

router.get("/exportnote/:id", fetchuser, async (req, res) => {
  try {
    let note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).send("Note Not Found");
    }

    // Ensure the user is authorized to export the note
    if (note.user.toString() !== req.user.id) {
      return res.status(401).send("Not Allowed");
    }

    // Create a new PDF document
    const doc = new PDFDocument();

    // Set the response to download the PDF
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="note-${note._id}.pdf"`
    );

    // Pipe the PDF into the response
    doc.pipe(res);

    // Add content to the PDF
    doc.fontSize(25).text("Note Title: " + note.title, {
      underline: true,
    });
    doc.moveDown();
    doc.fontSize(18).text("Description: " + note.description);
    doc.moveDown();
    doc.fontSize(15).text("Tag: " + note.tag);
    doc.moveDown();
    doc
      .fontSize(12)
      .text("Date Created: " + new Date(note.date).toLocaleString());

    // Finalize the PDF and end the stream
    doc.end();
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
});


module.exports=router