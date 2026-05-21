import APIRequest from "../APIRequest";

export const getPresignedImageUrl = async (objectName, token) => {
  if (!objectName) {
    console.warn('[getPresignedImageUrl] Missing objectName');
    return '';
  }

  if (!token) {
    console.warn('[getPresignedImageUrl] Missing token');
    return '';
  }

  try {
    console.log('[getPresignedImageUrl] Requesting URL for:', objectName);
    const api = new APIRequest();
    const res = await api.request(
      '/secureserver/presignedurl/generatePresignedURL',
      'GET',
      null,
      token,
      { objectName }
    );

    if (res?.success && res?.url) {
      console.log('[getPresignedImageUrl] Successfully resolved URL');
      return res.url;
    }

    console.warn('[getPresignedImageUrl] Failed response:', res);
    return '';
  } catch (error) {
    console.error('[getPresignedImageUrl] Error:', {
      objectName,
      error: error?.message,
      status: error?.status,
    });
    return '';
  }
};



