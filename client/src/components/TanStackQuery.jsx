import { useQuery } from "@tanstack/react-query";
import { useStore } from "../store/useStore";

const TanStackQuery = () => {
  const { fetchData } = useStore();

  const { isLoading, error, data } = useQuery({
    queryKey: ["todo"],
    queryFn: () => fetchData("https://dummyjson.com/products"),
    staleTime: 60 * 1000,
  })
  if (isLoading) return <h1>"Loading..."</h1>;

  if (error) return <p>Error: {error.message}</p>;

  return <div>{data.products.map((product) => (
   <h2 key={product.id}>DESC: {product.description}</h2>
  ))}</div>;
};

export default TanStackQuery;
