import React, { useContext, useEffect } from 'react';
import { Col, Container, Row } from "react-bootstrap";
import TypeBar from "../components/TypeBar";
import GenreBar from "../components/GenreBar";
import PublisherBar from "../components/PublisherBar";
import ProductList from "../components/ProductList";
import { observer } from "mobx-react-lite";
import { fetchProducts, fetchProductTypes } from "../http/productAPI";
import { Context } from "../index";
import Pages from "../components/Pages";
import { fetchPlatforms } from "../http/platformAPI";
import PlatformBar from "../components/PlatformBar";
import { fetchGenres, fetchPublishers, fetchOnlineGames } from "../http/productAPI";

const Shop = observer(() => {
    const { product, game } = useContext(Context);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [types, genres, publishers, platforms] = await Promise.all([
                    fetchProductTypes().catch(() => []),
                    fetchGenres().catch(() => []),
                    fetchPublishers().catch(() => []),
                    fetchPlatforms().catch(() => [])
                ]);

                product.setTypes(types);
                game.setGenres(genres);
                game.setPublishers(publishers);
                game.setPlatforms(platforms);

                const params = {
                    page: product.page,
                    limit: product.limit

                };

                if (product.selectedType) params.productTypeId = product.selectedType.id;
                if (game.selectedGenre) params.genreId = game.selectedGenre.id;
                if (game.selectedPublisher) params.publisherId = game.selectedPublisher.id;
                if (game.selectedPlatform && product.selectedType?.id === 2) params.platformId = game.selectedPlatform.id;

                if (product.selectedType?.id === 3) {
                    const onlineGames = await fetchOnlineGames().catch(() => []);
                    game.setOnlineGames(onlineGames);
                }

                const productsData = await fetchProducts(params);

                product.setProducts(productsData.rows);
                product.setTotalCount(productsData.count);
            } catch (e) {
                console.error('Ошибка загрузки данных:', e);
            }
        };

        loadData();
    }, [product.page, product.selectedType, game.selectedGenre, game.selectedPublisher, game.selectedPlatform, game.selectedGame, product, game]);

    const showCategories = product.selectedType?.id === 1;
    const showPlatforms = product.selectedType?.id === 2;
    const showGames = product.selectedType?.id === 3;
    const showAll = !product.selectedType;

    return (
        <Container>
            <Row className="mt-2">
                <Col md={3}>
                    <TypeBar />
                    {!showAll && showCategories && (
                        <>
                            <div className="mt-3"><GenreBar /></div>
                            <div className="mt-3"><PublisherBar /></div>
                        </>
                    )}
                    {!showAll && showPlatforms && (
                        <div className="mt-3"><PlatformBar /></div>
                    )}
                </Col>
                <Col md={9}>
                    <ProductList />
                    <Pages />
                </Col>
            </Row>
        </Container>
    );
});

export default Shop;