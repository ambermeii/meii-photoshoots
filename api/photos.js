import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

// `vercel dev --local` does not inject this unlinked project's local env file
// into functions, so load it as a development fallback. Hosted environment
// variables still take precedence because dotenv does not override by default.
dotenv.config({ path: ".env.local", quiet: true });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// Only these albums are available to the public website.
const albumFolders = {
  "point-reyes": "photography/beach_and_coast/point_reyes_ca",
};

export default async function handler(request, response) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    return response.status(405).json({ error: "Method not allowed." });
  }

  const album = request.query.album;
  const cursor = request.query.cursor;

  if (typeof album !== "string" || !Object.hasOwn(albumFolders, album)) {
    return response.status(404).json({ error: "Album not found." });
  }

  if (cursor !== undefined && typeof cursor !== "string") {
    return response.status(400).json({ error: "Invalid photo cursor." });
  }

  try {
    const result = await cloudinary.api.resources_by_asset_folder(
      albumFolders[album],
      {
        max_results: 50,
        direction: "asc",
        ...(cursor ? { next_cursor: cursor } : {}),
      }
    );

    const photos = result.resources
      .filter(
        (photo) =>
          photo.resource_type === "image" &&
          photo.type === "upload" &&
          photo.format !== "pdf"
      )
      .map((photo) => ({
        id: photo.asset_id,
        url: photo.secure_url,
      }));

    response.setHeader(
      "Cache-Control",
      "public, max-age=0, s-maxage=300, stale-while-revalidate=600"
    );

    return response.status(200).json({
      photos,
      nextCursor: result.next_cursor || null,
    });
  } catch {
    return response.status(502).json({
      error: "Unable to load photos from Cloudinary. Please try again.",
    });
  }
}
