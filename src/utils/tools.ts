import { getObjVal } from '@iceywu/utils'

// 获取用户头像
export function getUserAvatar(data: any) {
	const oldAvatar = getObjVal(data, 'avatar')
	const baseAvatar = getObjVal(data, 'avatarInfo.url')
	return baseAvatar || oldAvatar
}
