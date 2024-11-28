export const testUsers: {
  name: string;
  email: string;
  pw: string;
  count?: number;
}[] = [
  { name: "henryTest", email: "henryTest@mail.com", pw: process.env.PW! },
  { name: "georgeTest", email: "georgeTest@mail.com", pw: process.env.PW! },
  {
    name: "catherineTest",
    email: "catherineTest@mail.com",
    pw: process.env.PW!,
  },
  { name: "penelopeTest", email: "penelopeTest@mail.com", pw: process.env.PW! },
  { name: "jamesTest", email: "jamesTest@mail.com", pw: process.env.PW! },
  { name: "rubyTest", email: "rubyTest@mail.com", pw: process.env.PW! },
];
