import ContentBody from "./ContentBody";
import ContentTitle from "./ContentTitle";

export default function Container({ children }) {
  return (
    <div className="w-100 p-3 responsiveContainer">
      <ContentTitle />
      <ContentBody>{children}</ContentBody>
    </div>
  );
}
