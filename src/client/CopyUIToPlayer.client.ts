import { Players, StarterGui } from "@rbxts/services";

if (!game.IsLoaded()) game.Loaded.Wait();
for (const ui of StarterGui.GetChildren()) ui.Clone().Parent = Players.LocalPlayer.WaitForChild("PlayerGui");
