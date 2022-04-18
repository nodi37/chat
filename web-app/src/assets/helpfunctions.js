export function saveMessage(msg) {
    const messages = JSON.parse(sessionStorage.getItem("messages"));
    messages.push(msg);
    sessionStorage.setItem("messages", JSON.stringify(messages));
}

export function getContact(username) {
    const contacts = JSON.parse(sessionStorage.getItem("contacts"));
    return contacts.filter((contact)=>contact.username===username);
}