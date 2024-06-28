import { Schema , model } from "mongoose";

export interface ytSchemaProps{
    title : string;
    description : string;
    thumbnailUrl?:string;
    watched : boolean;
    youtubeName : string;
}

const favYoutubeVideoSchema = new Schema<ytSchemaProps>({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  thumbnailUrl: {
    type: String,
    default : "https://i.ytimg.com/an_webp/tz82ola3oy0/mqdefault_6s.webp?du=3000&sqp=CP3U-bMG&rs=AOn4CLBv82j7ia8BJJ-UVG2GDVtQwQdyBw",
    required: false,
  },
  watched: {
    type: Boolean,
    default : false,
    required: true,
  },
  youtubeName: {
    type: String,
    required: true,
  },

});

const favYoutubeVideoModel = model('fav-youtube-video' , favYoutubeVideoSchema  )

export default favYoutubeVideoModel;