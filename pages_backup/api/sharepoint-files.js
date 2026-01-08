import axios from 'axios';

export default async function handler(req, res) {
  const tenantId = 'TU_TENANT_ID'; // Reemplaza por tu Directory (Tenant) ID
  const clientId = 'TU_CLIENT_ID'; // Reemplaza por tu Application (Client) ID
  const clientSecret = 'TU_CLIENT_SECRET'; // Reemplaza por tu SecretoID
  const siteId = 'TU_SITE_ID'; // Reemplaza por tu Site ID
  const driveId = 'TU_DRIVE_ID'; // Reemplaza por tu Drive ID

  try {
    // 1. Obtener token de acceso
    const tokenResponse = await axios.post(
      `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
      new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret,
        scope: 'https://graph.microsoft.com/.default',
      })
    );
    const accessToken = tokenResponse.data.access_token;

    // 2. Consultar archivos en la carpeta
    const folderPath = '/Shared Documents'; // Cambia por tu carpeta
    const filesResponse = await axios.get(
      `https://graph.microsoft.com/v1.0/sites/${siteId}/drives/${driveId}/root:${folderPath}:/children`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    res.status(200).json(filesResponse.data.value);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
