import { environment } from "@environments/environment"
export const COOKIE_ACTO = `acto_${environment.env}`
export const COOKIE_RETO = `reto_${environment.env}`
export const API_GET_LOGGED_IN_USER = `${environment.api_url}/auth/me`

export const getCookies = async () => {
    const [acto, reto] = await Promise.all([
        chrome.cookies.get({ name: COOKIE_ACTO, url: environment.app_url }),
        chrome.cookies.get({ name: COOKIE_RETO, url: environment.app_url })
    ])
    return {
        acto,
        reto
    }
}