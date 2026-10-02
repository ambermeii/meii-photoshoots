import { useEffect, useState } from "react";

type Photo = {
  id: string;
  url: string;
};

type PhotoResponse = {
  photos?: Photo[];
  nextCursor?: string | null;
  error?: string;
};

async function readPhotoResponse(response: Response): Promise<PhotoResponse> {
  const contentType = response.headers.get("content-type") || "";

  if (!contentType.includes("application/json")) {
    throw new Error(
      "The gallery API is not running. Start the site with npx vercel dev --local."
    );
  }

  try {
    return (await response.json()) as PhotoResponse;
  } catch {
    throw new Error(
      "The gallery API returned an invalid response. Restart the site with npx vercel dev --local."
    );
  }
}

const categories = [
  {
    id: "coastal",
    title: "Coastal",
    cover:
      "https://res.cloudinary.com/wla1xxi0/image/upload/v1790979113/IMG_4297.jpg",
  },
];

const albums = [
  {
    id: "point-reyes",
    title: "Point Reyes, California",
    categoryId: "coastal",
    cover:
      "https://res.cloudinary.com/wla1xxi0/image/upload/v1790979113/IMG_4297.jpg",
  },
];

// Request smaller images for cards and the photo grid.
function imageUrl(url: string, width: number) {
  return url.replace(
    "/image/upload/",
    `/image/upload/f_auto,q_auto,c_limit,w_${width}/`
  );
}

function AlbumPhotos({ albumId }: { albumId: string }) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function loadPhotos() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(
          `/api/photos?album=${encodeURIComponent(albumId)}`,
          { signal: controller.signal }
        );

        const data = await readPhotoResponse(response);

        if (!response.ok) {
          throw new Error(data.error || "Unable to load photos.");
        }

        if (!controller.signal.aborted) {
          setPhotos(data.photos || []);
          setNextCursor(data.nextCursor || null);
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setError(
            error instanceof Error ? error.message : "Unable to load photos."
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void loadPhotos();

    return () => controller.abort();
  }, [albumId, reload]);

  async function loadMore() {
    if (!nextCursor || loading) return;

    setLoading(true);
    setError("");

    try {
      const parameters = new URLSearchParams({
        album: albumId,
        cursor: nextCursor,
      });

      const response = await fetch(`/api/photos?${parameters}`);
      const data = await readPhotoResponse(response);

      if (!response.ok) {
        throw new Error(data.error || "Unable to load more photos.");
      }

      setPhotos((previous) => {
        const existingIds = new Set(previous.map((photo) => photo.id));

        return [
          ...previous,
          ...(data.photos || []).filter((photo) => !existingIds.has(photo.id)),
        ];
      });

      setNextCursor(data.nextCursor || null);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Unable to load more photos."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="photo-grid">
        {photos.map((photo, index) => (
          <a
            key={photo.id}
            className="gallery-photo"
            href={imageUrl(photo.url, 2000)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Open photo ${index + 1} larger in a new tab`}
          >
            <img
              src={imageUrl(photo.url, 700)}
              alt={`Point Reyes photograph ${index + 1}`}
              loading="lazy"
            />
          </a>
        ))}
      </div>

      {loading && <p role="status">Loading photos…</p>}

      {error && (
        <div role="alert">
          <p>{error}</p>
          <button
            type="button"
            className="button"
            onClick={() => {
              if (photos.length > 0 && nextCursor) {
                void loadMore();
              } else {
                setReload((previous) => previous + 1);
              }
            }}
            disabled={loading}
          >
            Try again
          </button>
        </div>
      )}

      {!loading && !error && photos.length === 0 && (
        <p>
          No photos found. Check that the photos are directly inside this
          album’s Cloudinary folder.
        </p>
      )}

      {nextCursor && !error && (
        <button
          type="button"
          className="button load-more"
          onClick={() => void loadMore()}
          disabled={loading}
        >
          {loading ? "Loading…" : "Load more photos"}
        </button>
      )}
    </>
  );
}

export default function Gallery() {
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [albumId, setAlbumId] = useState<string | null>(null);

  const category = categories.find((item) => item.id === categoryId);

  const album = albums.find((item) => item.id === albumId);

  function goBack() {
    if (albumId) {
      setAlbumId(null);
    } else {
      setCategoryId(null);
    }

    window.scrollTo(0, 0);
  }

  return (
    <section className="gallery-page">
      {category && (
        <button type="button" className="back-button" onClick={goBack}>
          ← {album ? `Back to ${category.title}` : "Back to Photography"}
        </button>
      )}

      <p className="eyebrow">{album ? category?.title : "meii photoshoots"}</p>

      <h1>{album?.title || category?.title || "Photography"}</h1>

      {!category && <p>A collection of places, people, and moments.</p>}

      {album ? (
        <AlbumPhotos key={album.id} albumId={album.id} />
      ) : (
        <div className="album-grid">
          {(category
            ? albums.filter((item) => item.categoryId === category.id)
            : categories
          ).map((item) => (
            <button
              type="button"
              className="album-card"
              key={item.id}
              onClick={() => {
                if (category) {
                  setAlbumId(item.id);
                } else {
                  setCategoryId(item.id);
                }

                window.scrollTo(0, 0);
              }}
            >
              <img
                className="album-cover-image"
                src={imageUrl(item.cover, 800)}
                alt=""
                loading="lazy"
              />

              <span className="album-title">{item.title}</span>
              <span className="album-action">
                {category ? "View photos →" : "Explore albums →"}
              </span>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
