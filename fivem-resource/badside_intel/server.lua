local state = {} -- [serverId] = { area = string?, vehicle = string? }

local function log(...)
    if Config.Debug then print('[badside_intel]', ...) end
end

local function post(payload)
    PerformHttpRequest(Config.Endpoint, function(status, body)
        if status ~= 200 then
            print(('[badside_intel] ingest failed (%s): %s'):format(status, body or ''))
        else
            log('ok', payload.type)
        end
    end, 'POST', json.encode(payload), {
        ['Content-Type'] = 'application/json',
        ['x-api-key'] = Config.ApiKey,
    })
end

local function collectIdentifiers(src)
    local ids = {}
    for _, id in ipairs(GetPlayerIdentifiers(src)) do
        local kind = id:match('^(%w+):')
        -- IP is intentionally skipped
        if kind and kind ~= 'ip' then ids[kind] = id end
    end
    return ids
end

AddEventHandler('playerJoining', function()
    local src = source
    state[src] = {}
    post({
        type = 'join',
        serverId = tonumber(src),
        name = GetPlayerName(src),
        identifiers = collectIdentifiers(src),
    })
end)

AddEventHandler('playerDropped', function(reason)
    local src = source
    state[src] = nil
    post({ type = 'leave', serverId = tonumber(src), reason = reason })
end)

RegisterNetEvent('badside_intel:report', function(area, vehicle)
    local src = source
    state[src] = state[src] or {}
    state[src].area = type(area) == 'string' and area:sub(1, 80) or nil
    state[src].vehicle = type(vehicle) == 'string' and vehicle:sub(1, 80) or nil
end)

-- Call this from your framework when a character is selected, e.g.:
--   QBCore: AddEventHandler('QBCore:Server:PlayerLoaded', function(Player) ... end)
--   ESX:    AddEventHandler('esx:playerLoaded', function(src, xPlayer) ... end)
exports('CharacterLoaded', function(src, characterId, fullName, job, faction)
    post({
        type = 'character',
        serverId = tonumber(src),
        characterId = tonumber(characterId),
        fullName = fullName,
        job = job,
        faction = faction,
    })
end)

-- Batched heartbeat. Dashboard marks a player offline if no heartbeat arrives within the timeout.
CreateThread(function()
    while true do
        Wait(Config.HeartbeatInterval * 1000)
        local batch = {}
        for _, id in ipairs(GetPlayers()) do
            local src = tonumber(id)
            local s = state[src] or {}
            batch[#batch + 1] = {
                serverId = src,
                ping = GetPlayerPing(id),
                area = s.area,
                vehicle = s.vehicle,
            }
        end
        if #batch > 0 then
            post({ type = 'heartbeat', players = batch })
        end
    end
end)
