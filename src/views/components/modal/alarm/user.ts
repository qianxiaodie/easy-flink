
import Axios from 'axios';
export async function getUserList(req:any) {
  let resdata = []
  await Axios.get(`/HTAI/v2/api/portal/userIndex/getUserCount?userNo=${req}`, {
    headers: {
      'API_USER': '3be0a859885545b2b2bbb0157781636184a685b7cf6426c83909fe9'
    }
  })
    .then(res => {
      console.log(res)
      resdata = res.data;
    })
    .catch(err => {
      console.log(err);
    })

  return resdata;

}
