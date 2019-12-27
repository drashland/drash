import Drash from "https://deno.land/x/drash/mod.ts";

// Register MyThing as a global member
import myThing from "./my_thing.ts";
Drash.addMember("MyThing", new myThing());
