import { Entity } from "../models/entity";

interface Contact {
  name: string;
  email?: string;
  phone?: string;
}

// NOTE: Conceptually, this is how the API would be used. Just
// create an entity with the properties you want to set. I think
// somehow I'd like to encode the type into the entity too. This
// is supposed to be a dynamic data system, so it needs to be more than
// just typescript types.
//
// A challenge I'm still noodling on is that I want keys to be mutable without
// breaking the existing code. It would be easy enough if I just passed a version
// to the entity. That'd funamentally mean new properties couldn't be added to the
// entity though. Something to think more about.

const addContact = async (newContact: Contact) => {
  return await new Entity()
    .set("name", newContact.name)
    .then((e) => e.set("email", newContact.email))
    .then((e) => e.set("phone", newContact.phone));
};

const main = async () => {
  const contact = await addContact({
    name: "John Doe",
    email: "john.doe@example.com",
  });
  console.log(await contact.getAll());
};

main();
