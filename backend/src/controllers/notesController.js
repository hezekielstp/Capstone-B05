export function getAllNotes (req,res) {
    res.status(200).send ("you just fetch the notes");
}

export function createNote (req,res) {
    res.status(201).send ("Post created succesfully");
}

export function updateNote (req,res) {
    res.status(200).send ("Post updated succesfully");
}

export function deleteNote (req,res) {
    res.status(200).send ("Post deleted succesfully");
}