import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  URL_ESPECIES,
  URL_EVOLUCIONES,
  URL_POKEMON,
} from "../../../api/apiRest";
import css from "./card.module.scss";

export default function Card({ card }) {
  const [itemPokemon, setItemPokemon] = useState({});
  const [especiePokemon, setEspeciePokemon] = useState({});
  const [evoluciones, setEvoluciones] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${URL_POKEMON}/${card.name}`);
        setItemPokemon(response.data);
      } catch (error) {
        console.error("Error fetching Pokemon data:", error);
      }
    };

    fetchData();
  }, [card]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const URL = card.url.split("/");
        const response = await axios.get(`${URL_ESPECIES}/${URL[6]}`);
        setEspeciePokemon({
          url_especie: response?.data?.evolution_chain,
          data: response?.data,
        });
      } catch (error) {
        console.error("Error fetching Pokemon species data:", error);
      }
    };

    fetchData();
  }, [card]);

  useEffect(() => {
    const getPokemonImage = async (id) => {
      try {
        const response = await axios.get(`${URL_POKEMON}/${id}`);
        return response?.data?.sprites?.other["official-artwork"]?.front_default;
      } catch (error) {
        console.error("Error fetching Pokemon image:", error);
      }
    };

    const fetchEvolutions = async () => {
      try {
        const arrayEvoluciones = [];
        const URL = especiePokemon?.url_especie?.url.split("/");
        const response = await axios.get(`${URL_EVOLUCIONES}/${URL[6]}`);

        const addEvolution = async (species) => {
          const ID = species?.url?.split("/");
          const img = await getPokemonImage(ID[6]);

          arrayEvoluciones.push({
            img,
            name: species?.name,
          });
        };

        await addEvolution(response?.data?.chain?.species);

        if (response?.data?.chain?.evolves_to?.length !== 0) {
          const DATA2 = response?.data?.chain?.evolves_to[0]?.species;
          await addEvolution(DATA2);

          if (response?.data?.chain.evolves_to[0]?.evolves_to.length !== 0) {
            const DATA3 = response?.data?.chain?.evolves_to[0]?.evolves_to[0]?.species;
            await addEvolution(DATA3);
          }
        }

        setEvoluciones(arrayEvoluciones);
      } catch (error) {
        console.error("Error fetching Pokemon evolutions:", error);
      }
    };

    if (especiePokemon?.url_especie) {
      fetchEvolutions();
    }
  }, [especiePokemon]);

  let pokeId = itemPokemon?.id?.toString();
  if (pokeId?.length === 1) pokeId = "00" + pokeId;
  else if (pokeId?.length === 2) pokeId = "0" + pokeId;

  return (
    <div className={css.card}>
      <img
        className={css.img_poke}
        src={itemPokemon?.sprites?.other["official-artwork"]?.front_default}
        alt="pokemon"
      />
      <div className={`bg-${especiePokemon?.data?.color?.name} ${css.sub_card}`}>
        <strong className={css.id_card}>#{pokeId} </strong>
        <strong className={css.name_card}> {itemPokemon.name} </strong>
        <h4 className={css.altura_poke}> Altura: {itemPokemon.height}0 cm </h4>
        <h4 className={css.peso_poke}>Peso: {itemPokemon.weight} Kg </h4>
        <h4 className={css.habitat_poke}>
          Habitat: {especiePokemon?.data?.habitat?.name}{" "}
        </h4>

        <div className={css.div_stats}>
          {itemPokemon?.stats?.map((sta, index) => (
            <h6 key={index} className={css.item_stats}>
              <span className={css.name}> {sta.stat.name} </span>
              <progress value={sta.base_stat} max={110}></progress>
              <span className={css.numero}> {sta.base_stat} </span>
            </h6>
          ))}
        </div>

        <div className={css.div_type_color}>
          {itemPokemon?.types?.map((ti, index) => (
            <h6
              key={index}
              className={`color-${ti.type.name}  ${css.color_type} `}
            >
              {" "}
              {ti.type.name}{" "}
            </h6>
          ))}
        </div>

        <div className={css.div_evolucion}>
          {evoluciones.map((evo, index) => (
            <div key={index} className={css.item_evo}>
              <img src={evo.img} alt="evo" className={css.img} />
              <h6> {evo.name} </h6>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
