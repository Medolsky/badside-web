local lastReport = { area = nil, vehicle = nil }

local function currentArea()
    local coords = GetEntityCoords(PlayerPedId())
    local zone = GetLabelText(GetNameOfZone(coords.x, coords.y, coords.z))
    local streetHash = GetStreetNameAtCoord(coords.x, coords.y, coords.z)
    local street = GetStreetNameFromHashKey(streetHash)
    if street and street ~= '' then
        return ('%s / %s'):format(zone, street)
    end
    return zone
end

local function currentVehicle()
    local ped = PlayerPedId()
    if not IsPedInAnyVehicle(ped, false) then return nil end
    local veh = GetVehiclePedIsIn(ped, false)
    local label = GetLabelText(GetDisplayNameFromVehicleModel(GetEntityModel(veh)))
    local plate = GetVehicleNumberPlateText(veh)
    return ('%s [%s]'):format(label, plate and plate:gsub('%s+$', '') or '?')
end

-- Only area name + vehicle are reported, never raw coordinates.
CreateThread(function()
    while true do
        Wait(Config.ClientReportInterval * 1000)
        local area, vehicle = currentArea(), currentVehicle()
        if area ~= lastReport.area or vehicle ~= lastReport.vehicle then
            lastReport.area, lastReport.vehicle = area, vehicle
            TriggerServerEvent('badside_intel:report', area, vehicle)
        end
    end
end)
