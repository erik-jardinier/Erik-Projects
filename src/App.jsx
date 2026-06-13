import FloatingScene from "./components/FloatingScene";

export default function App() {
  return (
    <div style={{
      position: "fixed",
      top: 0, left: 0,
      width: "100vw",
      height: "100vh",
      background: "black",
      margin: 0,
      padding: 0,
      overflow: "hidden",
    }}>
      <FloatingScene />
    </div>
  );
}
