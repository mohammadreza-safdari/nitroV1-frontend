import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useCompareStore = defineStore('compare', () => {
    const vehicles = ref([])

    const addVehicle = (vehicle) => {
        if (vehicles.value.some(item => item.id === vehicle.id)) {
            return
        }

        if (vehicles.value.length >= 3) {
            return
        }

        vehicles.value.push(vehicle)
    }

    const removeVehicle = (vehicleId) => {
        vehicles.value = vehicles.value.filter(
            vehicle => vehicle.id !== vehicleId
        )
    }

    const hasVehicle = (vehicleId) => {
        return vehicles.value.some(
            vehicle => vehicle.id === vehicleId
        )
    }

    const clearVehicles = () => {
        vehicles.value = []
    }

    return {
        vehicles,
        addVehicle,
        removeVehicle,
        hasVehicle,
        clearVehicles,
    }
})
