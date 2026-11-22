import fetch from 'node-fetch';

export const uploadImage = async (base64) => {
  const resp = await fetch('https://api.imgbb.com/1/upload', {
    method: 'POST',
    body: new URLSearchParams({
      key: process.env.IMGBB_API_KEY,
      image: base64,
    }),
  });
  const data = await resp.json();
  if (!data.success) throw new Error('ImgBB upload failed');
  return data.data.url;
};
