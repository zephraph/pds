# PDS (Personal Data Store)

A research project exploring how one might build a personal data store that also facilitates the sharing of data between different stores.

## Usage scenario

Jane builds a contacts app in her personal data store. She shapes a contact as

```
name: string
phone number?: string
address?: string
```

Marget is a friend of Jane's who also has a personal data store. Her data store is mostly used for storing recipes, but she also
has a person type defined as

```
first name: string
last name: string
```

How would Jane send Marget one of her contacts? What would it mean for Marget to receive it? How would Marget map the contact defined
by Jane into something meaningful in her personal data store?

Those are the questions this project seeks to answer.

## Entity Storage

The fundamental building block of this project is the notion of an [Entity](https://en.wikipedia.org/wiki/Entity#In_computer_science). Fundamentally
an entity is just an object that can have any number of attributes. This concept is used in an [Entity-attribute-value model](https://en.wikipedia.org/wiki/Entity%E2%80%93attribute%E2%80%93value_model) to provide a loose way of storing data.
