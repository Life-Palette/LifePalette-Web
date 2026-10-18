import { useCallback, useState } from "react";
import MapEmbed, { type MapLocation } from "@/components/map/map-embed";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface LocationPickerProps {
  initialLocation?: MapLocation;
  isOpen: boolean;
  onClose: () => void;
  onLocationSelect: (location: MapLocation) => void;
}
export function LocationPicker({
  initialLocation,
  isOpen,
  onClose,
  onLocationSelect,
}: LocationPickerProps) {
  const [selection, setSelection] = useState(initialLocation);
  const confirm = useCallback(() => {
    if (selection) {
      onLocationSelect(selection);
      onClose();
    }
  }, [selection, onLocationSelect, onClose]);
  return (
    <Dialog onOpenChange={onClose} open={isOpen}>
      <DialogContent className="flex h-[min(600px,90dvh)] w-[calc(100%-2rem)] flex-col sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>选择地理位置</DialogTitle>
        </DialogHeader>
        <div className="min-h-0 flex-1">
          <MapEmbed
            location={initialLocation}
            mode="picker"
            onLocationSelect={setSelection}
          />
        </div>
        <div className="flex justify-end gap-3">
          <Button onClick={onClose} variant="outline">
            取消
          </Button>
          <Button disabled={!selection} onClick={confirm}>
            确认选择
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
