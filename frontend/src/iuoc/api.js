/**
 * ---------------------------------------------------------------------
 * 
 * This module is responsible of making HTTP call to the API endpoints.
 * 
 * ---------------------------------------------------------------------
 */

import { THINGSBOARD_API_ADDRESS, HTTP_METHODS, THINGSBOARD_LOGIN } from "./constants";

export async function connectThingsboard(){
    const response = await fetch(`${THINGSBOARD_API_ADDRESS}/api/auth/login`, {
        method: HTTP_METHODS.POST,
        headers: {
            "Accept": "application/json"
        },
        body: JSON.stringify(THINGSBOARD_LOGIN),
    })
    .then((result) => {return result.json()});
    return response
}

export async function get_deviceId_from_deviceName(token, deviceName){
    const response = await fetch(`${THINGSBOARD_API_ADDRESS}/api/tenant/devices?deviceName=${deviceName}`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'X-Authorization': `Bearer ${token}`
        }
    })
    .then((result) => {return result.json()})
    return response
}

export async function get_telemetry_from_deviceId(token, deviceId){
    const response = await fetch(`${THINGSBOARD_API_ADDRESS}/api/plugins/telemetry/DEVICE/${deviceId}/values/timeseries`, {
        method: 'GET',
        headers: {
            "Accept": "application/json",
            "X-Authorization": `Bearer ${token}`
        }
    })
    .then((result) => {return result.json()})
    return response
}

export async function get_attributes_from_deviceId(token, deviceID) {  
    const response = await fetch(`https://iuoc-tb.heig-vd.ch:443/api/device/info/${deviceID}`, {
        method: 'GET',
        headers: {
            "Accept": "application/json",
            "X-Authorization": `Bearer ${token}`
        }
    })
    .then((result) => {return result.json()})
    return response
}