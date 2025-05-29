import express from 'express';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Added Contact interface to provide type definitions and clear errors
interface Contact {
  id: number;
  email: string | null;
  phoneNumber: string | null;
  linkedId: number | null;
  linkPrecedence: 'primary' | 'secondary';
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

let contacts: Contact[] = [];
let nextId = 1;

const identifyHandler: express.RequestHandler = (req, res, next) => {
  const email = req.body.email ? req.body.email.trim() : null;
  const phone = req.body.phoneNumber ? String(req.body.phoneNumber).trim() : null;

  if (!email && !phone) {
    res.status(400).json({ error: 'Email or phone number required' });
    return;
  }

  const now = new Date();
  const matched = contacts.filter(c =>
    (!c.deletedAt) &&
    ((email && c.email === email) || (phone && c.phoneNumber === phone))
  );

  let primary: Contact;
  if (matched.length === 0) {
    primary = {
      id: nextId++,
      email,
      phoneNumber: phone,
      linkedId: null,
      linkPrecedence: 'primary' as 'primary',
      createdAt: now,
      updatedAt: now,
      deletedAt: null
    };
    contacts.push(primary);
  } else {
    // pick oldest root
    let root = matched[0];
    for (let i = 1; i < matched.length; i++) {
      if (matched[i].createdAt < root.createdAt) {
        root = matched[i];
      }
    }

    primary = root;

    const alreadyExists = matched.some(c =>
      c.email === email && c.phoneNumber === phone
    );

    if (!alreadyExists) {
      contacts.push({
        id: nextId++,
        email,
        phoneNumber: phone,
        linkedId: primary.id,
        linkPrecedence: 'secondary' as 'secondary',
        createdAt: now,
        updatedAt: now,
        deletedAt: null
      });
    }

    // flatten all related contacts under primary
    contacts.forEach(c => {
      if (c.linkedId === root.id || c.id === root.id) return;
      if (!c.deletedAt && (c.email === email || c.phoneNumber === phone)) {
        c.linkPrecedence = 'secondary';
        c.linkedId = primary.id;
        c.updatedAt = now;
      }
    });
  }

  // get all linked contacts
  const group = contacts.filter(c =>
    !c.deletedAt && (c.id === primary.id || c.linkedId === primary.id)
  );

  const emails = [...new Set(group.map(c => c.email).filter(Boolean))];
  const phones = [...new Set(group.map(c => c.phoneNumber).filter(Boolean))];
  const secondaryIds = group.filter(c => c.id !== primary.id).map(c => c.id);

  res.status(200).json({
    contact: {
      primaryContactId: primary.id,
      emails,
      phoneNumbers: phones,
      secondaryContactIds: secondaryIds
    }
  });
};

app.post('/identify', identifyHandler);

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
