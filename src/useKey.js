import { useEffect } from "react";

export function useKey(key, action) {
    useEffect(function () {
        function callBack(e) {
            console.log(e.code.toLowerCase(), key.toLowerCase())
            if (e.code.toLowerCase() === key.toLowerCase()) {
                action();
            }
        }
        document.addEventListener('keydown', callBack)
        return function () {
            document.removeEventListener('keydown', callBack)
        }
    }, [action, key]);
}