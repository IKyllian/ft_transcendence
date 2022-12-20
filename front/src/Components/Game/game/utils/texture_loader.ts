import { Scene, Textures } from "phaser";
import { UserInterface } from "../../../../Types/User-Types"
import AssetDefaultAvatar from '../../../../Images-Icons/pp.jpg'
import { getPlayerAvatar } from "../../../../Api/User-Fetch";

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

  if (
    user.avatar !== null 
    && cache !== undefined
    )
  {
    let result: string | undefined =  await getPlayerAvatar(cache, token, user.id, user.avatar);
    if (result)
    {
      scene.load.image(key, result);
    }
    else
    {
      await_load_base64(AssetDefaultAvatar, key, scene);
    }
  }
  else
  {
    await_load_base64(AssetDefaultAvatar, key, scene);
  }
}