
import { Scene, Textures } from "phaser";
import { getPlayerAvatar } from "../../../Utils/Utils-User";
import { CacheContext } from "../../../App";
import { useContext } from 'react';
import { UserInterface } from "../../../Types/User-Types"
import AssetDefaultAvatar from '../../../Images-Icons/pp.jpg'

const loadBase64Image = (props: {
  data: any;
  key: string;
  scene: Scene;
}) => {
  return new Promise<void>((resolve) => {
    props.scene.textures.once(Textures.Events.ADD, () => {
      resolve();
    });
    props.scene.textures.addBase64(props.key, props.data);
  });
};

export async function await_load_base64 (data: string, key: string, scene: Scene)
{
	await loadBase64Image({
		data: data,
		key: key,
		scene: scene,
		}); 
}

export async function loadAvatar (user: UserInterface, key:string, token: string, cache: Cache | null | undefined, scene: Scene)
{
//	const cache = useContext(CacheContext).cache;
  console.log('user.avatar', user.avatar, key);
  console.log('key', key);
  // console.log('token', token);
  // console.log('cache', cache);

  if (
    user.avatar !== null 
    && cache !== undefined 
   // && cache !== null
    )
  {
    let result: string | undefined =  await getPlayerAvatar(cache, token, user.id, user.avatar);
console.log('allo', key);
console.log('result', result);
    if (result)
    {
console.log('allo2', key);
      scene.load.image(key, result);
    }
    else
    {
console.log('allo3', key);
      await_load_base64(AssetDefaultAvatar, key, scene);
    }
  }
  else
  {
console.log('allo4', key);
    await_load_base64(AssetDefaultAvatar, key, scene);
  }

    //load default

}