import { API_GET_LOGGED_IN_USER, getCookies } from "./fetch_user.util";

export const fetchUserFromCookies = async () => {
    const { acto, reto } = await getCookies();

    if (!acto || !reto) {
        console.log("MISSING AUTH COOKIES - USER NOT SIGNED IN");
        return null;
    }

    const cookieHeader = `${acto.name}=${acto.value}; ${reto.name}=${reto.value}`;

    const response = await fetch(API_GET_LOGGED_IN_USER, {
        headers: {
            'Cookie': cookieHeader
        }
    })

    if (!response.ok) {
        console.log("FAILED TO FETCH USER FROM COOKIES");
    }

    const user = await response.json();
    return user;
}