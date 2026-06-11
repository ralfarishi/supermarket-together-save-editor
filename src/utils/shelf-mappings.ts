export function getSlotPositionName(subType: number, slotNumber: number): string {
  switch (subType) {
    case 1:
    case 14:
    case 15:
    case 38:
    case 39:
    case 40:
      if (slotNumber === 1) return "Bottom Tier";
      if (slotNumber === 2) return "Lower-Middle";
      if (slotNumber === 3) return "Upper-Middle";
      if (slotNumber === 4) return "Top Tier";
      return `Tier ${slotNumber}`;

    case 2:
      if (slotNumber === 1) return "Bottom Tier";
      if (slotNumber === 2) return "Lower-Middle";
      if (slotNumber === 3) return "Middle Tier";
      if (slotNumber === 4) return "Upper-Middle";
      if (slotNumber === 5) return "Top Tier";
      return `Tier ${slotNumber}`;

    case 3: {
      const col = slotNumber <= 5 ? "Left" : "Right";
      const tier = slotNumber <= 5 ? slotNumber : slotNumber - 5;
      let tierName = "";
      if (tier === 1) tierName = "Bottom";
      else if (tier === 2) tierName = "Lower-Mid";
      else if (tier === 3) tierName = "Middle";
      else if (tier === 4) tierName = "Upper-Mid";
      else if (tier === 5) tierName = "Top";
      return `${col} - ${tierName}`;
    }

    case 4:
      if (slotNumber === 1) return "Left Bin";
      if (slotNumber === 2) return "Right Bin";
      return `Bin ${slotNumber}`;

    case 8: {
      const col = slotNumber <= 5 ? "Left" : "Right";
      const tier = slotNumber <= 5 ? slotNumber : slotNumber - 5;
      let tierName = "";
      if (tier === 1) tierName = "Bottom";
      else if (tier === 2) tierName = "Lower-Mid";
      else if (tier === 3) tierName = "Middle";
      else if (tier === 4) tierName = "Upper-Mid";
      else if (tier === 5) tierName = "Top";
      return `${col} - ${tierName}`;
    }

    case 9: {
      if (slotNumber === 1) return "Bottom Side - Row 1 Left";
      if (slotNumber === 2) return "Bottom Side - Row 1 Right";
      if (slotNumber === 3) return "Top Side - Row 2 Left";
      if (slotNumber === 4) return "Top Side - Row 2 Right";
      if (slotNumber === 5) return "Bottom Side - Row 3 Corner Left";
      if (slotNumber === 6) return "Bottom Side - Row 3 Corner Right";
      if (slotNumber === 7) return "Top Side - Row 4 Left";
      if (slotNumber === 8) return "Top Side - Row 4 Right";
      if (slotNumber === 9) return "Bottom Side - Row 5 Left";
      if (slotNumber === 10) return "Bottom Side - Row 5 Right";
      return `Slot ${slotNumber}`;
    }

    case 11:
    case 13:
      if (slotNumber === 1) return "Bottom Left";
      if (slotNumber === 2) return "Bottom Right";
      if (slotNumber === 3) return "Top Left";
      if (slotNumber === 4) return "Top Right";
      return `Slot ${slotNumber}`;

    case 16:
      if (slotNumber === 1) return "Bottom Level";
      if (slotNumber === 2) return "Middle Level";
      if (slotNumber === 3) return "Top Level";
      return `Level ${slotNumber}`;

    case 17:
      return `Hook #${slotNumber}`;

    case 21:
    case 22:
      return "Floor Level";

    case 31: {
      const plasticTier = Math.ceil(slotNumber / 2);
      let plasticTierName = "";
      if (plasticTier === 1) plasticTierName = "Bottom";
      else if (plasticTier === 2) plasticTierName = "Lower-Mid";
      else if (plasticTier === 3) plasticTierName = "Middle";
      else if (plasticTier === 4) plasticTierName = "Upper-Mid";
      else if (plasticTier === 5) plasticTierName = "Top";
      const side = slotNumber % 2 === 1 ? "Left" : "Right";
      return `${plasticTierName} - ${side}`;
    }

    case 32:
    case 34:
      if (slotNumber === 1) return "Bottom Tier";
      if (slotNumber === 2) return "Lower-Middle";
      if (slotNumber === 3) return "Upper-Middle";
      if (slotNumber === 4) return "Top Tier";
      return `Tier ${slotNumber}`;

    case 37: {
      if (slotNumber <= 10) {
        const row = Math.ceil(slotNumber / 2);
        const side = slotNumber % 2 === 1 ? "Left" : "Right";
        let rowName = "";
        if (row === 1) rowName = "Bottom";
        else if (row === 2) rowName = "Lower-Mid";
        else if (row === 3) rowName = "Middle";
        else if (row === 4) rowName = "Upper-Mid";
        else if (row === 5) rowName = "Top";
        return `Side 1 (Wide) - ${rowName} ${side}`;
      } else if (slotNumber <= 14) {
        const row = slotNumber - 10;
        let rowName = "";
        if (row === 1) rowName = "Bottom Tier";
        else if (row === 2) rowName = "Lower-Middle";
        else if (row === 3) rowName = "Upper-Middle";
        else if (row === 4) rowName = "Top Tier";
        return `Side 2 (Narrow) - ${rowName}`;
      } else if (slotNumber <= 24) {
        const row = Math.ceil((slotNumber - 14) / 2);
        const side = slotNumber % 2 === 1 ? "Left" : "Right";
        let rowName = "";
        if (row === 1) rowName = "Bottom";
        else if (row === 2) rowName = "Lower-Mid";
        else if (row === 3) rowName = "Middle";
        else if (row === 4) rowName = "Upper-Mid";
        else if (row === 5) rowName = "Top";
        return `Side 3 (Wide) - ${rowName} ${side}`;
      } else {
        const row = slotNumber - 24;
        let rowName = "";
        if (row === 1) rowName = "Bottom Tier";
        else if (row === 2) rowName = "Lower-Middle";
        else if (row === 3) rowName = "Upper-Middle";
        else if (row === 4) rowName = "Top Tier";
        return `Side 4 (Narrow) - ${rowName}`;
      }
    }

    default:
      return `Slot ${slotNumber}`;
  }
}
