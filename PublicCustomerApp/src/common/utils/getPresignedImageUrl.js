import APIRequest from "../APIRequest";

export const getPresignedImageUrl = async (objectName, token ) => {
    try {
        const api = new APIRequest();
        const res = await api.request(`/secureserver/presignedurl/generatePresignedURL?objectName=${objectName}`,"GET",token);
        if (res?.success) {
            return res?.url;
          } else {
            return '';
          }
    } catch (error) {
        console.log(error, 'error getting address')
        return '';
    }
}


