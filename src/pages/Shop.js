import React, { useContext, useEffect } from 'react';
import { Col, Container, Row } from "react-bootstrap";
import TypeBar from "../components/TypeBar";
import TagBar from "../components/TagBar";
import PublisherBar from "../components/PublisherBar";
import ProductList from "../components/ProductList";
import { observer } from "mobx-react-lite";
import { fetchProducts, fetchProductTypes } from "../http/productAPI";
import { Context } from "../index";
import Pages from "../components/Pages";
import { fetchTags, fetchPublishers, fetchOnlineGames } from "../http/productAPI";

const Shop = observer(() => {
    const { product, game } = useContext(Context);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [types, tags, publishers] = await Promise.all([
                    fetchProductTypes().catch(() => []),
                    fetchTags().catch(() => []),
                    fetchPublishers().catch(() => []),
                ]);

                product.setTypes(types);
                game.setTags(tags);
                game.setPublishers(publishers);

                const params = {
                    page: product.page,
                    limit: product.limit
                };

                if (product.selectedType) {
                    params.productTypeId = product.selectedType.id;
                } else {
                    params.excludeTypes = [3];
                }
                if (game.selectedTag) params.tagId = game.selectedTag.id;
                if (game.selectedPublisher) params.publisherId = game.selectedPublisher.id;

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
    }, [product.page, product.selectedType, game.selectedTag, game.selectedPublisher, product, game]);

    const showCategories = product.selectedType?.id === 1 || product.selectedType?.id === 4;
    const showAll = !product.selectedType;

    return (
        <Container>
            <Row className="mt-2">
                <Col md={3}>
                    <TypeBar />
                    {!showAll && showCategories && (
                        <>
                            <div className="mt-3"><TagBar /></div>
                            <div className="mt-3"><PublisherBar /></div>
                        </>
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