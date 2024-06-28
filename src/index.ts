import { Hono } from "hono";
import { poweredBy } from "hono/powered-by";
import { logger } from "hono/logger";
import connectDB from "../db/connectDB";
import favYoutubeVideoModel from "../db/fav-yt-model";
import { isValidObjectId } from "mongoose";
import { stream, streamText, streamSSE } from "hono/streaming";

const app = new Hono();

// middleware
app.use(poweredBy());
app.use(logger());

connectDB()
  .then(() => {
    // GET List
    app.get("/", async (c) => {
      try{
        const docs = await favYoutubeVideoModel.find();
        return c.json(docs , 200);
      }catch(error){
        return c.json((error as any)?.message || "Internal Server Error", 500);
      }
    });
    
    // Create
    app.post('/' , async(c) => {
      const formData = await c.req.json();
      if(!formData.thumbnailUrl) delete formData.thumbnailUrl;

       const newDoc = new favYoutubeVideoModel(formData)
       try{
        const doc = await newDoc.save();
        return c.json(doc.toObject() , 201)
       }catch(error){
         return c.json(
          (error as any)?.message || 'Internal Server Error',500
         )
       }
    })

    // get by id /:id
    app.get('/:id' , async (c) =>{
       const {id} = c.req.param();

       if(!isValidObjectId(id)) return c.json("Invalid Id provided" , 400)
  
       const doc = await favYoutubeVideoModel.findById(id);

       if(!doc) return c.json("Document Not found in DB" , 500);
       return c.json(
        doc?.toObject(),200
       )
    })

    // stream by id
    app.get('/s/:id' , async (c)=>{
       const {id} = c.req.param();

       if(!isValidObjectId(id)) return c.json("Invalid id" , 500);

       const doc = await favYoutubeVideoModel.findById(id);

       if(!doc) return c.json("Document Not found in DB" , 500);

       return streamText(c , async(stream) =>{
          stream.onAbort(()=>{
            console.log('Aborted')
          })

          for(let i =0; i< doc.description.length ; i++){

            await stream.write(doc.description[i]);

            await stream.sleep(1000)
          }
       })
    })

    // update through PATCH : => update only those fields those  have new data
    app.patch('/:id' , async (c) =>{
      const {id} = c.req.param();
      if (!isValidObjectId(id)) return c.json("Invalid Id provided", 400);

      const formData = await c.req.json();

      if(!formData.thumbnailUrl) delete formData.thumbnailUrl;

      try{
        const updatedDoc = await favYoutubeVideoModel.findByIdAndUpdate(id , formData , { new :true});
        return c.json(updatedDoc?.toObject() , 200);
      }catch(err){
        return c.json((err as any)?.message || "Internal Server Error", 500);
      }

    })

    //  delete by id
    app.delete('/:id' , async (c) =>{
       const {id} = c.req.param();
       if(!isValidObjectId(id)) return c.json("Invalid Id" , 500);

       try{
         const deletedDoc = await favYoutubeVideoModel.findByIdAndDelete(id , )
         return c.json({ message : " You deleted ", deletedDoc} , 200)
       }catch(err){
        return c.json((err as any)?.message || "Internal Server Error", 500);
       }
    })

    app.delete('/' , async (c) =>{
      try{
        const deleteAll = await favYoutubeVideoModel.deleteMany();
        return c.json({ message : "All Docs have been Deleted"} , 200);

      }catch(error){
        return c.json((error as any)?.message || "Internal Server Error", 500);
      }
    })
  })
  .catch((err) => {
    app.get("/*", (c) => {
      return c.text("Failed to connect mongodb" + `${err.message}`);
    });
  });

app.onError((err, c) => {
  return c.text("Custom Error Message", 500);
});

export default app;
