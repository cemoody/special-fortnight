import { useState, useEffect } from "react";
import { connect } from "react-redux";
import { keyPress, setInfo } from "../redux/actions";
import { useDispatch } from "react-redux";
import useKeyPress from "../src/useKeyPress";

const Home = ({ current, possible }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    window.addEventListener(
      "keydown",
      function (e) {
        if (
          ["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].indexOf(
            e.code
          ) > -1
        ) {
          e.preventDefault();
        }
      },
      false
    );
  }, []);

  const ArrowUp = useKeyPress("ArrowUp");
  const ArrowDown = useKeyPress("ArrowDown");
  const ArrowLeft = useKeyPress("ArrowLeft");
  const ArrowRight = useKeyPress("ArrowRight");

  useEffect(() => {
    if (ArrowUp) dispatch(keyPress("up"));
  }, [ArrowUp]);
  useEffect(() => {
    if (ArrowDown) dispatch(keyPress("down"));
  }, [ArrowDown]);
  useEffect(() => {
    if (ArrowLeft) dispatch(keyPress("left"));
  }, [ArrowLeft]);
  useEffect(() => {
    if (ArrowRight) dispatch(keyPress("right"));
  }, [ArrowRight]);

  return (
    <>
      {current.level == 0 ? `at brand level ` : `at product image `}
      <Card
        key={current.image.id}
        brand={current.brand}
        product={current.product}
        image={current.image}
        invisible={false}
      />
      {possible.map((el) => (
        <Card
          key={el.image.id}
          brand={el.brand}
          product={el.product}
          image={el.image}
          invisible={true}
        />
      ))}
    </>
  );
};

const Card = ({ name, setInfo, brand, product, image, invisible = false }) => {
  const [newName, setName] = useState("");

  return (
    <>
      {invisible ? (
        <img
          key={image.id}
          src={image.src}
          style={{ height: "0px", width: "0px", display: "inline" }}
        />
      ) : (
        <>
          <p />
          brand: {brand}
          <p />
          product: {product.title}
          <p />
          image: {image.id}
          <p />
          price: ${product.variants[0].price}
          <img key={image.src} src={image.src} width="100%" />
        </>
      )}
    </>
  );
};

const mapStateToProps = (state) => {
  return {
    current: state.position.current,
    possible: state.position.possible,
  };
};

const mapDispatchToProps = {
  setInfo,
};

export default connect(mapStateToProps, mapDispatchToProps)(Home);
